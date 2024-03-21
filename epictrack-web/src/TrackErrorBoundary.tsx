import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import ErrorPage from "routes/ErrorPage";

function Fallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return <ErrorPage onReset={resetErrorBoundary} />;
}

export const TrackErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  return (
    <ErrorBoundary FallbackComponent={Fallback} onReset={() => navigate("/")}>
      {children}
    </ErrorBoundary>
  );
};
