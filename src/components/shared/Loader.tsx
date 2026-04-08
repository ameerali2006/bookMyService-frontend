import { Loader2 } from 'lucide-react';

interface LoaderProps {
  message: string;
}

function Loader({ message }: LoaderProps) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
            <span className="ml-2 text-teal-600">{message}</span>
        </div>
    );
}

export default Loader