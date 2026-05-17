import { StageNavigation } from '@app/components/Layout/StageNavigation';
import { TitleNavigation } from '@app/components/Layout/TitleNavigation';
import { HashRouter, Route } from '@solidjs/router';
import type { Component, ParentComponent } from 'solid-js';
import { createEffect, createSignal } from 'solid-js';
import { Drawer } from './components/Drawer';
import { routes } from './routes';
import Welcome from './stages/Welcome';


const Layout: ParentComponent = (props) => {
  const [drawerOpen, setDrawerOpen] = createSignal(false);

  createEffect(() => {
    setDrawerOpen(false);
  });

  return (
    <>
      <button
        aria-label="Открыть меню"
        class="fixed top-4 left-4 z-40 rounded-lg border border-[#d8deea] bg-white p-2.5 text-[#1f2a44] transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#9eb3da]"
        onClick={() => setDrawerOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" x2="20" y1="12" y2="12"/>
          <line x1="4" x2="20" y1="6" y2="6"/>
          <line x1="4" x2="20" y1="18" y2="18"/>
        </svg>
      </button>

      <div class="min-h-screen bg-[#f8faff]">
        <div class="mx-auto w-full max-w-[1024px] px-4 py-6">
          <div class="lg:hidden h-14" />
          <div class="min-h-[calc(100vh-3rem)] flex flex-col">
            <div class="flex-1">
              <TitleNavigation />
              {props.children}
            </div>
            <StageNavigation />
          </div>
        </div>
      </div>

      <Drawer isOpen={drawerOpen()} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

const App: Component = () => {
  return (
    <HashRouter root={Layout}>
      <Route path="/" component={() => <Welcome />} />
      {routes}
      <Route path="*" component={() => 'Not found'} />
    </HashRouter>
  );
};

export default App;