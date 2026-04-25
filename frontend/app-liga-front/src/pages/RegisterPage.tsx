import { useState } from "react";
import { useRegister } from "../features/auth/hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
    const { handleRegister, loading, error } = useRegister();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<"admin" | "player">("player");

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const success = await handleRegister(email, username, password, role);
        if (success) navigate("/");
    };

    return (
        <div style={styles.container}>
            <form onSubmit={onSubmit} style={styles.form}>
                <h2>{t('register.title')}</h2>

                <input
                    type="email"
                    placeholder={t('register.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />

                <input
                    type="text"
                    placeholder={t('register.username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder={t('register.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "admin" | "player")}
                    required
                    style={styles.input}
                >
                    <option value="player">{t('register.rolePlayer')}</option>
                    <option value="admin">{t('register.roleAdmin')}</option>
                </select>

                {error && <p style={styles.error}>{error}</p>}

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? t('register.loading') : t('register.submit')}
                </button>
                <p style={styles.hint}>
                    {t('register.hasAccount')}{' '}
                    <span style={styles.link} onClick={() => navigate('/login')}>{t('register.login')}</span>
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
