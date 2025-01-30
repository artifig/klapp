import { useAssessment } from '@/context/AssessmentContext';
import { routes } from '@/navigation';

export function useNavigationGuard() {
  const { state } = useAssessment();

  const isStepAccessible = (path: string) => {
    switch (path) {
      case routes.home:
        return true;
      case routes.setup:
        return Boolean(state.goal?.trim());
      case routes.assessment:
        return Boolean(state.goal?.trim()) &&
          Boolean(state.formData.name) &&
          Boolean(state.formData.company) &&
          Boolean(state.formData.email) &&
          Boolean(state.formData.companyType);
      case routes.results:
        return Boolean(state.goal?.trim()) &&
          Boolean(state.formData.name) &&
          Boolean(state.formData.company) &&
          Boolean(state.formData.email) &&
          Boolean(state.formData.companyType) &&
          Object.keys(state.answers).length === 2;
      default:
        return false;
    }
  };

  return { isStepAccessible };
} 