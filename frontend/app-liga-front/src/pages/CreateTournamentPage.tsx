import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createTournament } from "../features/tournaments/api";
import type { Tournament } from "../types";

type Config = Omit<Tournament, 'tourney_id' | 'name' | 'status'>;

const DEFAULT_CONFIG: Config = {
    hit_head: 3,
    hit_torso: 2,
    hit_arm: 1,
    hit_legs: 1,
    scoring_mode: 'total',
    allow_ties: true,
    players_advance: 2,
};

export default function CreateTournamentPage() {
    const [name, setName] = useState('');
    const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const set = (key: keyof Config, value: string | number) =>
        setConfig(prev => ({ ...prev, [key]: value }));

    const handleCreate: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const res = await createTournament(name, config);
        if (res) navigate(`/tournaments/${res.tourney_id}`);
    };

    return (
        <div>
            <h1>{t('createTournament.title')}</h1>

            <form onSubmit={handleCreate} style={styles.form}>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('createTournament.placeholder')}
                    required
                    style={styles.input}
                />

                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>{t('createTournament.rules')}</h3>
                    <div style={styles.grid}>
                        {(['hit_head', 'hit_torso', 'hit_arm', 'hit_legs'] as const).map(key => (
                            <label key={key} style={styles.label}>
                                {t(`createTournament.${key}`)}
                                <input
                                    type="number" min={0} max={99}
                                    value={config[key] as number}
                                    onChange={e => set(key, Number(e.target.value))}
                                    style={styles.numberInput}
                                />
                            </label>
                        ))}
                    </div>
                    <label style={styles.label}>
                        {t('createTournament.scoring_mode')}
                        <select
                            value={config.scoring_mode}
                            onChange={e => set('scoring_mode', e.target.value)}
                            style={styles.input}
                        >
                            <option value="total">{t('createTournament.scoring_total')}</option>
                            <option value="difference">{t('createTournament.scoring_difference')}</option>
                        </select>
                    </label>

                    <label style={{ ...styles.label, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={config.allow_ties}
                            onChange={e => setConfig(prev => ({ ...prev, allow_ties: e.target.checked }))}
                        />
                        {t('createTournament.allow_ties')}
                    </label>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>{t('createTournament.configuration')}</h3>
                    <div style={styles.grid}>
                        {([
                            ['players_advance', 1, 8],
                        ] as const).map(([key, min, max]) => (
                            <label key={key} style={styles.label}>
                                {t(`createTournament.${key}`)}
                                <input
                                    type="number" min={min} max={max}
                                    value={config[key] as number}
                                    onChange={e => set(key, Number(e.target.value))}
                                    style={styles.numberInput}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" style={styles.btn}>{t('createTournament.submit')}</button>
            </form>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    form: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' },
    card: { border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
    sectionTitle: { margin: 0, fontSize: '15px', fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    label: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#374151' },
    input: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #d1d5db' },
    numberInput: { padding: '6px 8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #d1d5db', width: '70px' },
    btn: { padding: '10px 24px', cursor: 'pointer', alignSelf: 'flex-start' },
};
