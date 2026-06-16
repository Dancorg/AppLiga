import { useState } from "react";
import { createLeague } from "../features/leagues/api";
import type { LeagueRules } from "../features/leagues/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DEFAULT_RULES: LeagueRules = {
    hit_head: 3,
    hit_torso: 2,
    hit_arm: 1,
    hit_legs: 1,
    scoring_mode: 'total',
    allow_ties: true,
};

export default function CreateLeaguePage() {
    const [leagueName, setLeagueName] = useState("");
    const [rules, setRules] = useState<LeagueRules>(DEFAULT_RULES);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const setRule = (key: keyof LeagueRules, value: string | number) => {
        setRules(prev => ({ ...prev, [key]: value }));
    };

    const handleCreate: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const res = await createLeague(leagueName, rules);
        if (res) navigate(`/leagues/${res.league_id}`);
    };

    return (
        <div>
            <h1>{t('createLeague.title')}</h1>

            <form onSubmit={handleCreate} style={styles.form}>
                <input
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    placeholder={t('createLeague.placeholder')}
                    required
                    style={styles.input}
                />

                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>{t('createLeague.rules')}</h3>

                    <div style={styles.grid}>
                        {(['hit_head', 'hit_torso', 'hit_arm', 'hit_legs'] as const).map(key => (
                            <label key={key} style={styles.label}>
                                {t(`createLeague.${key}`)}
                                <input
                                    type="number"
                                    min={0}
                                    max={99}
                                    value={rules[key]}
                                    onChange={(e) => setRule(key, Number(e.target.value))}
                                    style={styles.numberInput}
                                />
                            </label>
                        ))}
                    </div>

                    <label style={styles.label}>
                        {t('createLeague.scoring_mode')}
                        <select
                            value={rules.scoring_mode}
                            onChange={(e) => setRule('scoring_mode', e.target.value)}
                            style={styles.input}
                        >
                            <option value="total">{t('createLeague.scoring_total')}</option>
                            <option value="difference">{t('createLeague.scoring_difference')}</option>
                        </select>
                    </label>

                    <label style={{ ...styles.label, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={rules.allow_ties}
                            onChange={(e) => setRules(prev => ({ ...prev, allow_ties: e.target.checked }))}
                        />
                        {t('createLeague.allow_ties')}
                    </label>
                </div>

                <button type="submit" style={styles.btn}>{t('createLeague.submit')}</button>
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
