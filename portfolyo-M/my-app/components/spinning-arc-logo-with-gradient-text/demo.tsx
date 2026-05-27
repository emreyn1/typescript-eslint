import Logo  from "@/components/spinning-arc-logo-with-gradient-text/spinning-arc-logo-with-gradient-text";

const DemoOne = () => {
  return (
     <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center overflow-visible">
      <div className="flex items-center justify-center">
        <Logo size={500} />
      </div>
    </div>
  );
};

export default DemoOne;
