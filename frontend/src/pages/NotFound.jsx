import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-light-sage text-dark-green">
        <Compass size={30} />
      </div>
      <h1 className="font-heading text-3xl font-bold text-dark-green">Page Not Found</h1>
      <p className="max-w-sm text-sm text-text-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button variant="primary" onClick={() => navigate("/")}>
        Back to Home
      </Button>
    </div>
  );
}
