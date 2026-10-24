import { AboutSection, HomeSection, ProjectGallery, ScrollNav } from "./portfolio/index";

export default function Portfolio() {
  return (
    <div className="bg-paper relative min-h-screen w-full" data-name="Landing">
      <ScrollNav />
      <div className="relative mx-auto w-full max-w-[1512px]">
        <HomeSection />
        <ProjectGallery />
        <AboutSection />
      </div>
    </div>
  );
}
