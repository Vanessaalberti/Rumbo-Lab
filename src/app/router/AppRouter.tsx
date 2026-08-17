import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AccessLayout } from '@/app/layouts/AccessLayout';
import { PrivateLayout } from '@/app/layouts/PrivateLayout';
import { ApprenticeShell } from '@/app/layouts/ApprenticeShell';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { RequireExperience } from '@/app/guards/RequireExperience';
import { RedirectIfAuthenticated } from '@/app/guards/RedirectIfAuthenticated';
import { LandingPage } from '@/pages/landing';
import { CreateSpacePage, SignInPage } from '@/pages/authentication';
import { ChooseExperiencePage } from '@/pages/experience';
import {
  ApplicationsSection,
  AtsTesterSection,
  CvMatchSection,
  CvsSection,
  EntrevistaSection,
  EvidencesSection,
  GoalsSection,
  OratoriaSection,
  PreparationSection,
  FeedbackSection,
  PerfilSection,
  SpacesSection,
} from '@/pages/apprentice';
import { MentorPanelPlaceholderPage } from '@/pages/mentor';
import { SettingsPage } from '@/pages/settings';
import { NotFoundPage } from '@/pages/errors';
import { ROUTES } from '@/constants/routes';

/**
 * Mapa de rutas de la aplicación.
 *
 * Los flujos de acceso usan su propio layout: sin navegación de secciones ni
 * pie, para que la única decisión posible sea avanzar. `RedirectIfAuthenticated`
 * los aparta de quien ya tiene sesión.
 *
 * El área privada cuelga de `RequireAuth`. `/elegir-experiencia` solo exige
 * sesión — es el lugar para activar Aprendiz y/o Mentor. `/mi-rumbo` exige
 * además la experiencia Aprendiz (`RequireExperience`) y monta `ApprenticeShell`
 * (rail + secciones), con Mi Perfil como índice.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.landing} element={<LandingPage />} />
          <Route path={ROUTES.notFound} element={<NotFoundPage />} />
        </Route>

        <Route element={<RedirectIfAuthenticated />}>
          <Route element={<AccessLayout />}>
            <Route path={ROUTES.createSpace} element={<CreateSpacePage />} />
            <Route path={ROUTES.signIn} element={<SignInPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<PrivateLayout />}>
            <Route path={ROUTES.chooseExperience} element={<ChooseExperiencePage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />

            <Route element={<RequireExperience experience="apprentice" />}>
              <Route path={ROUTES.myRumbo} element={<ApprenticeShell />}>
                <Route index element={<PerfilSection />} />
                <Route path="postulaciones" element={<ApplicationsSection />} />
                <Route path="cvs" element={<CvsSection />} />
                <Route path="objetivos" element={<GoalsSection />} />
                <Route path="espacios" element={<SpacesSection />} />
                <Route path="preparacion" element={<PreparationSection />} />
                <Route path="preparacion/comparar-cv" element={<CvMatchSection />} />
                <Route path="preparacion/oratoria" element={<OratoriaSection />} />
                <Route path="preparacion/tester-ats" element={<AtsTesterSection />} />
                <Route path="preparacion/entrevista" element={<EntrevistaSection />} />
                <Route path="feedback" element={<FeedbackSection />} />
                <Route path="evidencias" element={<EvidencesSection />} />
              </Route>
            </Route>

            <Route element={<RequireExperience experience="mentor" />}>
              <Route path={ROUTES.mentorPanel} element={<MentorPanelPlaceholderPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
