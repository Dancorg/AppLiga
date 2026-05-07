import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t, i18n } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleLang = () => {
        const next = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(next);
        localStorage.setItem('lang', next);
    };

    const navLink = (to: string): React.CSSProperties => ({
        ...styles.link,
        fontWeight: pathname === to ? 700 : 400,
        textDecoration: pathname === to ? 'underline' : 'none',
    });

    return (
        <nav style={styles.nav}>
            <div style={styles.left}>
                <span onClick={() => navigate('/leagues')} style={navLink('/leagues')}>
                    {t('nav.leagues')}
                </span>
                <span onClick={() => navigate('/tournaments')} style={navLink('/tournaments')}>
                    {t('nav.tournaments')}
                </span>
            </div>
            <div style={styles.right}>
                <button onClick={toggleLang} style={styles.langBtn}>
                    {i18n.language === 'es' ? 'EN' : 'ES'}
                </button>
                {user && (
                    <span style={styles.chip}>
                        {user.username}
                        <span style={styles.role}>{user.role}</span>
                    </span>
                )}
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    {t('nav.logout')}
                </button>
            </div>
        </nav>
    );
}

const styles: Record<string, React.CSSProperties> = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '52px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
    },
    left: { display: 'flex', gap: '24px', alignItems: 'center' },
    right: { display: 'flex', gap: '12px', alignItems: 'center' },
    link: { cursor: 'pointer', fontSize: '14px', color: '#111827' },
    chip: {
        fontSize: '13px',
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    role: {
        fontSize: '11px',
        background: '#e5e7eb',
        borderRadius: '4px',
        padding: '1px 6px',
        color: '#6b7280',
    },
    langBtn: {
        fontSize: '12px',
        padding: '3px 10px',
        cursor: 'pointer',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        background: 'white',
        fontWeight: 600,
    },
    logoutBtn: {
        fontSize: '13px',
        padding: '4px 12px',
        cursor: 'pointer',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        background: 'white',
    },
};
