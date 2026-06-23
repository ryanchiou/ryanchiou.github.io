import { HomeSection, ProjectGallery, ScrollNav } from "./portfolio/index";

export default function Portfolio() {
  return (
    <div className="bg-frame relative min-h-screen w-full cursor-auto" data-name="Landing">
      <ScrollNav />
      <div className="relative mx-auto w-full max-w-[1512px]">
        <HomeSection />
        <ProjectGallery />
      </div>
    </div>
  );
}
