import Navbar from './Navbar';
import { useAuth } from '../auth/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    return (
        <>
            {token && <Navbar />}
            <main style={{ padding: '20px' }}>
                {children}
            </main>
        </>
    );
}
