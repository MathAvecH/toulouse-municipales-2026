// Candidate mapping from parquet column codes to display names
// T1: codes 001-011, T2: codes 005 (Moudenc) and 012 (Piquemal)

export const T1_CANDIDATES = {
  '005': { name: 'Jean-Luc MOUDENC', shortName: 'Moudenc', party: 'LDVD', color: '#e2001a', listName: 'Avec Jean-Luc Moudenc, Protégeons l\'Avenir de Toulouse' },
  '004': { name: 'François PIQUEMAL', shortName: 'Piquemal', party: 'LFI', color: '#cc2443', listName: 'Demain Toulouse à gauche et écologiste' },
  '003': { name: 'François BRIANÇON', shortName: 'Briançon', party: 'LUG', color: '#ff6b6b', listName: 'Vivre mieux La gauche unie, écologiste, citoyenne et solidaire' },
  '008': { name: 'Julien LEONARDELLI', shortName: 'Leonardelli', party: 'LRN', color: '#0d2240', listName: 'Le bon sens toulousain' },
  '007': { name: 'Lambert MEILHAC', shortName: 'Meilhac', party: 'LDVC', color: '#ff9f43', listName: 'Nouvel air' },
  '011': { name: 'Arthur COTTREL', shortName: 'Cottrel', party: 'LREC', color: '#2e4057', listName: 'A LA RECONQUETE ! DE TOULOUSE' },
  '002': { name: 'Vanessa PEDINOTTI', shortName: 'Pedinotti', party: 'LEXG', color: '#a855f7', listName: 'UNE TRAVAILLEUSE AU CAPITOLE' },
  '001': { name: 'Malena ADRADA', shortName: 'Adrada', party: 'LEXG', color: '#6366f1', listName: 'LUTTE OUVRIÈRE - LE CAMP DES TRAVAILLEURS' },
  '009': { name: 'Guillaume SCALI', shortName: 'Scali', party: 'LEXG', color: '#8b5cf6', listName: 'NPA Révolutionnaires- Toulouse ouvrière et révolutionnaire.' },
  '010': { name: 'Julian MENENDEZ', shortName: 'Menendez', party: 'LEXG', color: '#7c3aed', listName: 'Toulouse pour les jeunes, les travailleurs et les services publics, contre les budgets de guerre' },
};

export const T2_CANDIDATES = {
  '005': { name: 'Jean-Luc MOUDENC', shortName: 'Moudenc', party: 'LDVD', color: '#e2001a' },
  '012': { name: 'François PIQUEMAL', shortName: 'Piquemal', party: 'LFI', color: '#cc2443' },
};

// Column layout in parquet files:
// T1: 10 candidate pairs (code in column_17,19,21,...,35 / votes in column_18,20,22,...,36)
// T2: 2 candidate pairs  (code in column_17,19 / votes in column_18,20)
export const T1_CANDIDATE_PAIRS = Array.from({length: 10}, (_, i) => ({
  codeCol: `column_${17 + i * 2}`,
  votesCol: `column_${18 + i * 2}`,
}));

export const T2_CANDIDATE_PAIRS = [
  { codeCol: 'column_17', votesCol: 'column_18' },
  { codeCol: 'column_19', votesCol: 'column_20' },
];

// Candidate colors for charts
export const CANDIDATE_COLORS = {
  'Moudenc': '#e2001a',
  'Piquemal': '#cc2443',
  'Briançon': '#ff6b6b',
  'Leonardelli': '#0d2240',
  'Meilhac': '#ff9f43',
  'Cottrel': '#2e4057',
  'Pedinotti': '#a855f7',
  'Adrada': '#6366f1',
  'Scali': '#8b5cf6',
  'Menendez': '#7c3aed',
};
