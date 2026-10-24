"""Cut src/assets/tiles_proj/hvbox.png (the exploded HV enclosure render) into the
part layers HvboxExplode slides together into the assembled pose.

    pip install numpy scipy scikit-image pillow   # plus `cwebp` on PATH
    python scripts/hvbox-layers.py [source.png] [output-dir]

The render is a parallel projection, so a part moving in 3D moves in a straight
line in 2D. Each layer is a part cut from the exploded render; ASSEMBLED holds
how far it travels (source px) to its assembled spot. Most parts explode
straight up; the heatsink also slides out along the box's long axis. Positions
come from the parts themselves: the lid's front edge lands on the box rim, the
connector flanges' bolt holes line up with the lid / front-wall holes, and the
internals sit where the box, lid and connectors hide them.

A few pixels have to be invented because the render never shows them: the box
rim behind the front connectors, a strip of the big connector behind the small
one, and the box interior under the lid's raised right corner. All of them sit
behind other parts in the exploded pose, so the stack still reproduces the
original image exactly when exploded.

Writes one WebP per layer (cropped to its bounds) plus layers.json, which
HvboxExplode reads for positions, offsets and stacking.
"""
import json, os, shutil, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage.filters import sobel
from skimage.segmentation import watershed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "src/assets/tiles_proj/hvbox.png")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "src/assets/tiles_proj/hvbox")
SCALE = 0.65  # the tile shows the render ~325 CSS px tall; this keeps 2x screens sharp

if not shutil.which("cwebp"):
    sys.exit("cwebp not found (brew install webp)")

E = np.asarray(Image.open(SRC).convert("RGB")).astype(np.int16)
H, W = E.shape[:2]
R, G, B = E[..., 0], E[..., 1], E[..., 2]
yy, xx = np.mgrid[0:H, 0:W]
nonwhite = E.min(axis=2) < 250


def near(c, tol):
    return np.abs(E - np.array(c)).max(axis=2) <= tol


def poly(pts):
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon(pts, fill=1)
    return np.asarray(m).astype(bool)


# ── segmentation ───────────────────────────────────────────
# Rough outlines seed each part (by colour where parts touch); a watershed on
# the image gradient then snaps the boundaries to the render's edge lines.
lavender = (R - G > 10) & (B - R > 40) & (B > 180)                  # lid top
lid_edge = near((75, 66, 103), 22) & (B - G > 25)                    # lid sheet thickness
box_metal = near((117, 128, 153), 22) | near((88, 86, 151), 16) | near((167, 182, 219), 16)

PARTS = {  # earlier entries win where outlines overlap
    "fcl_rear": [(434, 822), (470, 815), (512, 815), (512, 842), (462, 853), (436, 862)],
    "fcl": [(458, 852), (590, 815), (602, 818), (627, 840), (627, 950), (600, 963), (520, 973), (462, 952), (452, 880)],
    "fcr": [(703, 776), (712, 769), (842, 739), (858, 743), (871, 758), (871, 881), (830, 898), (718, 894), (703, 873)],
    "fcc_rear": [(336, 845), (390, 836), (391, 945), (360, 952), (336, 925)],
    "fcc": [(391, 836), (420, 836), (446, 858), (446, 937), (425, 952), (391, 948)],
    "bc_tabs": [(447, 410), (496, 410), (497, 440), (561, 434), (561, 513), (494, 513), (482, 500), (447, 478)],
    "bc_tab2": [(671, 393), (753, 390), (753, 461), (674, 463)],
    "lc": [(112, 352), (178, 298), (240, 268), (292, 260), (334, 265), (394, 292), (402, 302), (410, 330),
           (444, 348), (444, 478), (482, 500), (488, 528), (470, 562), (400, 592), (300, 600), (292, 588),
           (150, 472), (112, 432)],
    "bc": [(380, 228), (410, 203), (440, 173), (470, 93), (560, 70), (737, 76), (792, 173), (807, 215),
           (802, 290), (860, 320), (862, 354), (760, 392), (753, 461), (700, 464), (561, 513), (561, 434),
           (497, 440), (496, 410), (447, 410), (447, 350), (412, 333), (404, 304), (396, 294), (380, 282)],
    "lid": [(48, 545), (862, 348), (1037, 500), (862, 567), (354, 727), (318, 727), (48, 562)],
    "box": [(140, 890), (178, 893), (322, 1004), (870, 838), (885, 850), (885, 1031), (870, 1029),
            (330, 1200), (320, 1199), (170, 1084), (140, 1106)],
    "tray": [(138, 1078), (170, 1084), (320, 1199), (330, 1200), (870, 1029), (885, 1033), (892, 1252),
             (330, 1428), (178, 1335), (138, 1292)],
    "int": [(160, 620), (330, 690), (354, 727), (560, 652), (690, 560), (800, 538), (955, 538), (958, 702),
            (872, 702), (871, 758), (858, 743), (842, 739), (712, 769), (703, 776), (703, 873), (640, 872),
            (560, 838), (512, 815), (470, 815), (434, 822), (336, 845), (336, 1012), (160, 1012)],
}
ID = {name: i + 1 for i, name in enumerate(PARTS)}
markers = np.zeros((H, W), np.int32)
claimed = np.zeros((H, W), bool)
for name, pts in PARTS.items():
    region = poly(pts)
    inner = ndi.binary_erosion(region, iterations=4)
    if name == "lid":
        seed = inner & (lavender | lid_edge)
    else:
        seed = inner & nonwhite & ~lavender & ~lid_edge
    if name.startswith("fc"):  # front connectors overlap the box rim
        seed &= ~box_metal
    seed = ndi.binary_erosion(seed, iterations=1) & ~claimed
    markers[seed] = ID[name]
    claimed |= region if name != "lid" else seed
grad = sobel(E.mean(axis=2) / 255.0)
for c in range(3):
    grad = np.maximum(grad, sobel(E[..., c] / 255.0))
lab = watershed(grad, markers, mask=nonwhite)
# stray unlabelled pixels take their nearest neighbour's part
idx = ndi.distance_transform_edt(lab == 0, return_distances=False, return_indices=True)
lab = np.where(nonwhite, lab[idx[0], idx[1]], 0)

# Internals reached up into the lid's edge band and hole outlines; anything
# above the lid's lower edge belongs to the lid.
lid_low = np.full(W, -1)
for x in range(W):
    c = np.where((lab[:760, x] == ID["lid"]) & lavender[:760, x])[0]
    if len(c):
        lid_low[x] = c.max()
internal = lab == ID["int"]
below = yy - lid_low[None, :]
band = internal & (lid_low[None, :] >= 0) & (
    ((below <= 6) & (B - R > 20) & (R < 170)) |      # the violet edge face
    ((below <= 3) & (E.max(axis=2) < 110)))          # its outline
lab[band | (internal & (below < 0))] = ID["lid"]
# ...and the thin dark outline under that face (a short dark run, not a dark part's body).
dark = E.max(axis=2) < 110
for x in np.where(lid_low >= 0)[0]:
    y, stop = lid_low[x] + 1, min(H, lid_low[x] + 10)
    while y < stop:
        if not dark[y, x]:
            y += 1
            continue
        run = 0
        while y + run < H and dark[y + run, x]:
            run += 1
        if run <= 3:
            sl = slice(y, y + run)
            lab[sl, x] = np.where(lab[sl, x] == ID["int"], ID["lid"], lab[sl, x])
        y += run
    # anti-aliased outline pixels with the white background right under them
    for y in range(lid_low[x] + 1, min(H - 2, lid_low[x] + 10)):
        if lab[y, x] == ID["int"] and not nonwhite[y + 1:y + 3, x].all():
            lab[y, x] = ID["lid"]

# The lid cut-out's outline under the small connector's flange belongs to the lid.
lab[(lab == ID["lc"]) & (xx < 300) & (yy > 472 + (xx - 150) * 116 / 142 + 3)] = ID["lid"]

# Split the internals by what has to move where.
internal = lab == ID["int"]
tan = (R > 150) & (G > 100) & (B < 120)
heat = internal & (((xx >= 800) & (yy < 690)) | ((xx >= 870) & (yy < 715)))  # fins reach below the bracket's top
bracket = internal & (xx >= 713) & (yy >= 625) & ~heat & ~((xx < 800) & (yy < 648) & ~tan)
# small loose bits on the bracket's side go with it
cc, n = ndi.label(internal & ~heat & ~bracket, structure=np.ones((3, 3)))
for i, sl in enumerate(ndi.find_objects(cc)):
    piece = cc[sl] == i + 1
    if piece.sum() < 100 and sl[1].start >= 713:
        bracket[sl] |= piece
LAYER_MASKS = {name: lab == i for name, i in ID.items() if name not in ("int", "bc_tab2")}
LAYER_MASKS["bc_tabs"] |= lab == ID["bc_tab2"]
LAYER_MASKS["int_heat"] = heat
LAYER_MASKS["int_bracket"] = bracket
LAYER_MASKS["int"] = internal & ~heat & ~bracket  # PCB, busbar, sensor, the black part, standoffs

# ── pixels the render never shows ──────────────────────────
colour = E.astype(np.float32).copy()
extra = {name: np.zeros((H, W), bool) for name in LAYER_MASKS}
extra_col = {name: np.zeros((H, W, 3), np.float32) for name in LAYER_MASKS}
FACE, LEFT_WALL, LIP, INK, INTERIOR = (117, 128, 153), (167, 182, 219), (88, 86, 151), (22, 24, 30), (62, 60, 98)


def front_top(x):  # the front wall's top edge line
    return -0.3857 * x + 1156.6 - 2 if x <= 700 else 884 - (x - 700) * 27 / 170


def add(layer, y, x, c):
    extra[layer][y, x] = True
    extra_col[layer][y, x] = c


# Box rim behind the front connectors: lip (tapering off by x=690), edge line, face.
behind_fc = LAYER_MASKS["fcl"] | LAYER_MASKS["fcl_rear"] | LAYER_MASKS["fcr"]
for x in range(320, 872):
    yt, t = round(front_top(x)), round(float(np.interp(x, [440, 640, 690], [18, 6, 0])))
    for y in np.where(behind_fc[:, x])[0]:
        if y < yt - t - 2:
            continue
        add("box", y, x, INK if y <= yt - t - 1 or yt - 1 <= y <= yt + 1 else LIP if y < yt - 1 else FACE)
# Left-wall rim behind the two loose standoffs.
loose = LAYER_MASKS["int"] & (yy > 870)
for x in range(170, 340):
    yt = round(893 + (x - 178) * 111 / 144) if x <= 322 else round(front_top(x))
    for y in np.where(loose[:, x])[0]:
        if y >= yt - 1:
            add("box", y, x, INK if y <= yt + 1 else (LEFT_WALL if x <= 322 else FACE))
# The lid's right section is bent up, leaving a wedge between it and the box
# rim once assembled; show the shadowed box interior there. In the exploded
# pose this sits behind the right front connector.
LID_DROP = 295
fcr_solid = ndi.binary_erosion(LAYER_MASKS["fcr"], iterations=1)
for x in range(708, 871):
    lid_edge_y = (-0.3851 * x + 861.7 if x <= 790 else -0.243 * x + 752) + LID_DROP
    for y in range(int(lid_edge_y) - 3, round(front_top(x)) + 1):
        if fcr_solid[y, x] and not extra["box"][y, x]:
            add("box", y, x, INTERIOR)
# Big connector strip hidden behind the small connector's right edge (the big
# one drops 20px further): copy its nearest visible pixel along the row.
bc = LAYER_MASKS["bc"]
for y in range(280, 462):
    row = np.where(bc[y, 380:480])[0]
    if not len(row):
        continue
    xb = 380 + row[0]
    for x in range(max(0, xb - 26), xb):
        if LAYER_MASKS["lc"][y, x]:
            add("bc", y, x, E[y, min(xb + 2, W - 1)])

# ── assembled pose (source px; + is right / down) ──────────
ASSEMBLED = {
    "lid": (0, LID_DROP),            # front edge onto the box rim
    "lc": (0, LID_DROP + 84),        # flange holes over the lid holes, less flange thickness
    "bc": (0, LID_DROP + 104),       # bosses over the lid holes, less boss + flange height
    "bc_tabs": (0, LID_DROP + 104),
    "fcl": (-3, 167), "fcl_rear": (-3, 167),   # flange holes onto the wall holes
    "fcr": (-3, 167),
    "fcc": (29, 203), "fcc_rear": (29, 203),   # face into the round cut-out
    "tray": (0, -160),               # floor's front edge flush with the wall's bottom edge
    "int": (0, 112),                 # all hidden by the box, lid and connectors
    "int_bracket": (0, 80),
    "int_heat": (-155, 158),         # slides back in along the box's long axis
    "box": (0, 0),
}
# Back to front. The *_rear pieces sit behind the box so they vanish into the
# wall; bc_tabs sit behind the lid so they sink through its cut-out.
Z = ["tray", "int", "int_bracket", "int_heat", "fcl_rear", "fcc_rear", "box",
     "fcl", "fcr", "fcc", "bc_tabs", "lid", "bc", "lc"]
# Motion groups (HvboxExplode staggers these).
GROUP = {"lid": "lid", "lc": "lid", "bc": "lid", "bc_tabs": "lid", "tray": "tray",
         "int": "int", "int_bracket": "int", "int_heat": "int",
         "fcl": "fc", "fcl_rear": "fc", "fcr": "fc", "fcc": "fc", "fcc_rear": "fc", "box": "box"}

# ── layers ─────────────────────────────────────────────────
# Opaque inside; a 1.5px rim against the white background is un-blended from
# white so edges don't carry a halo over other parts.
inside = ndi.distance_transform_edt(nonwhite)
c2a = np.clip((255.0 - E.min(axis=2)) / 255.0, 0, 1)
alpha = np.where(inside > 1.5, 1.0, c2a) * nonwhite
rgb = np.clip((colour - (1 - alpha[..., None]) * 255.0) / np.maximum(alpha[..., None], 1e-3), 0, 255)
layer_a = {n: np.where(extra[n], 1.0, np.where(LAYER_MASKS[n], alpha, 0.0)) for n in Z}
layer_c = {n: np.where(extra[n][..., None], extra_col[n], rgb) for n in Z}


def moved(a, name):
    dx, dy = ASSEMBLED[name]
    return ndi.shift(a, (dy, dx), order=0, cval=0)


# Last pass: any pixel left see-through inside the assembled silhouette joins
# the neighbouring part, but only where that part's exploded position is
# covered by parts in front of it, so the exploded image stays exact.
cover_asm = np.zeros((H, W))
front_of = {}
for name in Z:
    cover_asm = cover_asm + moved(layer_a[name], name) * (1 - cover_asm)
for i, name in enumerate(Z):
    f = np.zeros((H, W))
    for other in Z[i + 1:]:
        f = f + layer_a[other] * (1 - f)
    front_of[name] = f > 0.99
holes = cover_asm < 0.5
lab_h, n_h = ndi.label(holes)
edge_ids = set(np.unique(np.concatenate([lab_h[0], lab_h[-1], lab_h[:, 0], lab_h[:, -1]])))
gaps = np.isin(lab_h, [i for i in range(1, n_h + 1) if i not in edge_ids])
top = np.full((H, W), -1)   # front-most part at each assembled pixel
for i, name in enumerate(Z):
    top[moved(layer_a[name], name) > 0.5] = i
_, (ny, nx) = ndi.distance_transform_edt(top < 0, return_indices=True)
filled_gaps = 0
for y, x in zip(*np.where(gaps)):
    name = Z[top[ny[y, x], nx[y, x]]]
    dx, dy = ASSEMBLED[name]
    sy, sx = y - dy, x - dx
    if 0 <= sy < H and 0 <= sx < W and front_of[name][sy, sx]:
        qy, qx = ny[y, x] - dy, nx[y, x] - dx
        layer_a[name][sy, sx] = 1.0
        layer_c[name][sy, sx] = layer_c[name][qy, qx]
        filled_gaps += 1
print(f"assembled gaps: {int(gaps.sum())} px, filled {filled_gaps}")

# ── export ─────────────────────────────────────────────────
os.makedirs(OUT, exist_ok=True)
TMP = tempfile.mkdtemp()
CW, CH = round(W * SCALE), round(H * SCALE)
pct = lambda v, total: round(float(v) / total * 100, 3)
manifest = {"canvas": [CW, CH], "layers": []}
assembled_box = [W, H, 0, 0]
for name in Z:
    a, c = layer_a[name], layer_c[name]
    # Downscale the whole canvas premultiplied (no dark edge fringe), then crop
    # on whole target pixels so every layer shares one pixel grid.
    small = lambda arr: np.asarray(Image.fromarray(arr.astype(np.float32), mode="F").resize((CW, CH), Image.BOX))
    aa = small(a)
    pm = np.stack([small(c[..., k] * a) for k in range(3)], -1)
    ys, xs = np.where(aa > 1 / 255)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    aa, pm = aa[y0:y1, x0:x1], pm[y0:y1, x0:x1]
    col = np.where(aa[..., None] > 1e-4, pm / np.maximum(aa[..., None], 1e-4), 0)
    rgba = np.dstack([col.clip(0, 255), (aa * 255).clip(0, 255)])
    png = os.path.join(TMP, f"{name}.png")
    Image.fromarray(rgba.round().astype(np.uint8), "RGBA").save(png)
    subprocess.run(["cwebp", "-quiet", "-q", "88", "-alpha_q", "100", "-m", "6", png,
                    "-o", os.path.join(OUT, f"{name}.webp")], check=True)
    dx, dy = ASSEMBLED[name]
    manifest["layers"].append({
        "name": name, "group": GROUP[name],
        "left": pct(x0, CW), "top": pct(y0, CH), "width": pct(x1 - x0, CW), "height": pct(y1 - y0, CH),
        # translate() percentages are of the layer's own box
        "ax": pct(dx * SCALE, x1 - x0), "ay": pct(dy * SCALE, y1 - y0),
    })
    ys2, xs2 = np.where(a > 0.5)
    assembled_box = [min(assembled_box[0], xs2.min() + dx), min(assembled_box[1], ys2.min() + dy),
                     max(assembled_box[2], xs2.max() + 1 + dx), max(assembled_box[3], ys2.max() + 1 + dy)]
shutil.rmtree(TMP)
bx0, by0, bx1, by1 = assembled_box
manifest["assembled"] = {"left": pct(bx0, W), "top": pct(by0, H), "width": pct(bx1 - bx0, W), "height": pct(by1 - by0, H)}
with open(os.path.join(OUT, "layers.json"), "w") as f:
    json.dump(manifest, f, indent=1)
print(f"canvas {CW}x{CH}; {len(Z)} layers -> {OUT}")
print("assembled bounds (% of canvas):", manifest["assembled"])
