import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AccessLayout } from '@/app/layouts/AccessLayout';
import { LandingPage } from '@/pages/landing';
import { CreateSpacePage, SignInPage } from '@/pages/authentication';
import { NotFoundPage } from '@/pages/errors';
import { ROUTES } from '@/constants/routes';

/**
 * Mapa de rutas de la aplicación.
 *
 * Los flujos de acceso usan su propio layout: sin navegación de secciones ni
 * pie, para que la única decisión posible sea avanzar.
 *
 * Las áreas de aprendiz, mentor y organización se montarán como ramas propias,
 * cada una con su layout y sus guards.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.landing} element={<LandingPage />} />
          <Route path={ROUTES.notFound} element={<NotFoundPage />} />
        </Route>

        <Route element={<AccessLayout />}>
          <Route path={ROUTES.createSpace} element={<CreateSpacePage />} />
          <Route path={ROUTES.signIn} element={<SignInPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
