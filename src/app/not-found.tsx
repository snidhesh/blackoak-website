import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button href="/" variant="outline">
          RETURN TO HOMEPAGE
        </Button>
      </div>
    </section>
  );
}
