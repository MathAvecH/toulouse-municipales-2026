Thread d'analyse des résultats électoraux par bureau de vote à Toulouse

Auteur : @glupommedeterre\_

Je suis en train d'analyser les résultats par bureau de vote à Toulouse.

Il y a un bureau qui se distingue particulièrement des autres : le bureau n°102 (école maternelle Didier Daurat).

Au 1er tour, il cumule en effet 3 records différents :

Piquemal y réalise son score le plus élevé : 64,1%

Moudenc y réalise son score le plus faible : 17,6%

C'est le bureau où la participation est la plus faible : 15,73%...

De manière générale et comme on pouvait s'y attendre, il y a une corrélation négative entre la participation et le vote Piquemal. Mais il y a des corrélations qui sont encore plus flagrantes.

Je vous partagerai dans ce fil toutes les observations que je fais au fur et à mesure (jusqu'à ce que j'en aie marre et que je retourne à mes edits).

📊 Graphique 1 : Score de Piquemal en fonction de la participation (1er tour)

Corrélation : -0.465 (Tendance à la baisse : moins il y a de participation, plus Piquemal a un score élevé).

Ressources utilisées :

pour la visualisation par bureau de vote : resultats.elections.toulouse.fr

pour les sets de données : data.toulouse-metropole.fr

Pour Moudenc on a une corrélation plutôt positive avec la participation : les bureaux qui s'abstiennent peu votent beaucoup Moudenc. Mais c'est quand même assez dispersé.

Par contre pour Briançon... la corrélation est encore plus flagrante.

📊 Graphique 2 : Score de Moudenc en fonction de la participation (1er tour)

Corrélation : 0.355 (Tendance à la hausse modérée).

📊 Graphique 3 : Score de Briançon en fonction de la participation (1er tour)

Corrélation : 0.565 (Tendance à la hausse claire : forte participation = vote Briançon plus élevé).

Tout ça nous donne déjà quelques infos intéressantes sur la sociologie de chaque électorat.

Ensuite les bureaux qui votent beaucoup Piquemal votent peu pour Moudenc, et inversement. Mais pas de corrélation Briançon/Moudenc ou Briançon/Piquemal.

Bon là je m'égare un peu, je vais essayer de trouver des trucs intéressants dans la petite heure qui me reste.

📊 Graphique 4 : Score de Moudenc en fonction du score de Piquemal (1er tour)

Corrélation : -0.867 (Forte corrélation négative : les scores s'opposent quasi-parfaitement).

📊 Graphique 5 : Score de Briançon en fonction du score de Piquemal (1er tour)

Corrélation : -0.096 (Pas de corrélation : nuage de points très dispersé).

📊 Graphique 6 : Score de Briançon en fonction du score de Moudenc (1er tour)

Corrélation : -0.282 (Faible corrélation).

Les données du 2nd tour (t2) sont désormais importées et mergées avec celles du 1er tour (t1). Là on va commencer à s'amuser.

Déjà on peut constater que tous les bureaux, à l'exception d'un seul, bénéficient d'une hausse de participation au 2nd tour.

📊 Graphique 7 : Histogramme - Répartition de la hausse de participation sur les 284 bureaux de vote.

Montre une cloche centrée autour de +4% à +5% de hausse de participation entre le T1 et le T2.

C'est le bureau n°126 (Salle Lafage), qui vote majoritairement pour... Piquemal.
(Je précise que dans mon calcul de la participation, je n'ai pris en compte que les votes exprimés, donc pas les votes blancs/nuls, ce qui sous-estime légèrement la participation par rapport aux chiffres officiels).

Le bureau évoqué en début de thread (le 102 - Maternelle Didier Daurat) connaît une très forte hausse de participation, passant ici de 15,7% à 23,8% (ça reste très peu mdr) mais il reste le bureau avec la participation la plus faible.

Maintenant on va faire une analyse plus globale.

📊 Graphique 8 : Score de Moudenc en fonction de la hausse de participation (2nd tour)

Corrélation : 0.144

C'est peut-être le graphe le plus important à regarder si on cherche à savoir vers où se sont dirigés les nouveaux votants.

Bah le résultat est un peu éclatax. Une corrélation très légèrement positive en faveur de Moudenc. Bon après c'est normal d'avoir beaucoup de dispersion.

Pour ceux qui seraient perdus : plus le nuage de points est resserré et affiche une tendance croissante, plus ça signifie que les nouveaux votants se sont mobilisés pour Moudenc.

Ici ça ressemble plutôt à une grosse patate, mais encore une fois le maillage à l'échelle des bureaux de vote a ses limites, et il y a plein de facteurs de dispersion possibles qu'on ne maîtrise pas.

Ici le même graphe mais avec le score du t1 :

📊 Graphique 9 : Score de Moudenc en fonction de la hausse de participation (1er tour)

Corrélation : 0.222

Ça ne sert à rien d'afficher le même graphe pour Piquemal car c'est exactement le même en sens inverse.

Il y a peut-être des analyses supplémentaires à faire, notamment :

faire des comparaisons de score t2 vs t1 par bureau de vote

essayer de regarder de plus près le comportement des électeurs de Briançon

Mais là j'ai pas le temps, je reviendrai dessus plus tard !

(En tout cas s'il y a bien une conclusion qu'on peut tirer pour le moment, c'est que si l'électorat de gauche se mobilise autant que celui de droite, on fume Moudenc).

Je vous laisse avec ce graphique...

📊 Graphique 10 : Hausse des votes blancs/nuls (T2) en fonction du score de Briançon (T1)

Corrélation : 0.548 (Tendance claire : plus Briançon a fait un score élevé au T1, plus le nombre de votes blancs ou nuls a augmenté au T2 dans ces bureaux).

J'ai commencé à construire des modèles de report de voix pour déterminer la redistribution de l'électorat Briançon ainsi que des nouveaux votants au 2nd tour.

Les premiers résultats que j'ai sont assez... saisissants. Ils semblent confirmer certaines craintes qui ont été formulées.

J'aimerais d'abord consolider ces résultats avant de les partager.

Comme c'est la première fois que je travaille sur ce genre de modèle, s'il y a des connaisseurs ou des curieux qui veulent partager des choses à ce sujet, vous êtes les bienvenu.e.s !
