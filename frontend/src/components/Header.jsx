import { Youtube } from 'lucide-react';

const Header = () => {
  return (
    <header className="glass-card mx-4 md:mx-auto max-w-4xl mt-4 md:mt-8 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 p-2 rounded-xl">
            <Youtube className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold gradient-text">YT Downloader</h1>
            <p className="text-gray-400 text-xs md:text-sm">Fast • Free • Secure</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
