import { useState } from "react";
import { useLogin } from "../features/auth/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
    const { handleLogin, loading, error } = useLogin();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const success = await handleLogin(email, password);
        if (success) navigate("/");
    };

    return (
        <div style={styles.container}>
            <form onSubmit={onSubmit} style={styles.form}>
                <h2>{t('login.title')}</h2>

                <input
                    type="email"
                    placeholder={t('login.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder={t('login.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />

                {error && <p style={styles.error}>{error}</p>}

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? t('login.loading') : t('login.submit')}
                </button>
                <p style={styles.hint}>
                    {t('login.noAccount')}{' '}
                    <span style={styles.link} onClick={() => navigate('/register')}>{t('login.register')}</span>
                </p>
            </form>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5" },
    form: { display: "flex", flexDirection: "column", gap: "12px", padding: "24px", borderRadius: "8px", background: "white", width: "300px" },
    input: { padding: "10px", fontSize: "14px" },
    button: { padding: "10px", cursor: "pointer" },
    error: { color: "red", fontSize: "14px" },
    hint: { textAlign: "center", fontSize: "13px", color: "#6b7280", margin: 0 },
    link: { color: "#2563eb", cursor: "pointer", textDecoration: "underline" },
};
