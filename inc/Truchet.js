/**
 *  Truchet Class
 *  Generates Truchet compositions based on the original ones as described in "Description des Metiers" (Sebastien Truchet, 1705)
 *  See [http://jacques-andre.fr/faqtypo/truchet/truchet-planches.pdf]
 */
class Truchet {
	constructor() {
		//The alphabet employed by Truchet in order to generate the name of the different rules
		this.alphabet = [
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
			"I",
			"K",
			"L",
			"M",
			"N",
			"O",
			"P",
			"Q",
			"R",
			"S",
			"T",
			"V",
			"U",
			"X",
			"Y",
			"Z"
		];
	}

	/**
	 *  Creates a new set of rules. This was reeaally boring. @_@
	 *  If I was smarter I would have discovered some magic mathematics behind all, maybe the origin of the universe.
	 *  But I'm not.
	 */
	createRules(a, b, c, d) {
		let int = [
			//Premiere planche
			//A
			[
				[a, c],
				[c, a]
			],
			//B
			[[c], [a]],
			//C
			[[c]],
			//D
			[
				[a, c, c],
				[c, a, c],
				[c, c, a]
			],
			//E
			[[c, a, a, c]],
			//F
			[
				[a, c],
				[c, a],
				[c, a],
				[a, c]
			],
			//G
			[
				[a, b],
				[d, c]
			],
			//H
			[
				[a, b, c, d],
				[b, a, d, c],
				[c, d, a, b],
				[d, c, b, a]
			],
			//I
			[
				[c, b],
				[d, a]
			],
			//K
			[
				[a, d, c, b],
				[b, c, d, a],
				[c, b, a, d],
				[d, a, b, c]
			],
			//L
			[
				[c, d],
				[b, c, d, a],
				[c, b, a, d],
				[b, a]
			],
			//M
			[
				[a, b],
				[b, a]
			],

			//Seconde planche
			//N
			[
				[a, d],
				[c, b]
			],
			//O
			[
				[a, b],
				[c, d]
			],
			//P
			[
				[a, b, c, d],
				[c, d, a, b]
			],
			//Q
			[
				[c, c, d, d],
				[a, a, b, b]
			],
			//R
			[
				[a, c, d, b],
				[a, c, d, b]
			],
			//S
			[
				[c, c, b, b, c, c, d, d, a, a, d, d],
				[a, a, d, d, a, a, b, b, c, c, b, b]
			],
			//T
			[[a, b, c, d]],
			//V
			[
				[c, d, c, d, a, b, a, b],
				[a, b, a, b, c, d, c, d]
			],
			//U
			[[c, d]],
			//X
			[
				[a, a, b, b, c, c, d, d],
				[a, a, b, b, c, c, d, d],
				[b, b, a, a, d, d, c, c],
				[b, b, a, a, d, d, c, c]
			],
			//Y
			[
				[c, c, d, d],
				[c, c, d, d],
				[b, b, a, a],
				[b, b, a, a]
			],
			//Z
			[
				[a, d, c, b, c, b],
				[b, c, d, a, d, a],
				[c, b, a, d, a, d],
				[d, a, b, c, b, c],
				[c, b, a, d, a, d],
				[d, a, b, c, b, c]
			],

			// Troiseme planche
			//Aa
			[
				[a, c, b, d],
				[c, a, d, b]
			],
			//Ba
			[
				[d, c, a, b, d, c],
				[b, d, c, d, c, a]
			],
			//Ca
			[
				[a, c, d, b],
				[c, a, b, d]
			],
			//Da
			[
				[d, c, a, b],
				[c, a, b, d]
			],
			//Ea
			[[a, c, b, d]],
			//Fa
			[
				[d, c, a],
				[b, d, c]
			],
			//Ga
			[
				[c, d, c, d, a, b, a, b],
				[b, d, c, a, d, d, c, c],
				[c, a, b, d, a, a, b, b],
				[b, a, b, a, d, c, d, c],
				[a, b, a, b, c, d, c, d],
				[d, d, c, c, b, d, c, a],
				[a, a, b, b, c, a, b, d],
				[d, c, d, c, b, a, b, a]
			],
			//Ha
			[
				[a, c, c, a],
				[c, a, a, c],
				[c, a, a, c],
				[a, c, c, a]
			],
			//Ia
			[
				[a, c, d, b],
				[a, a, b, b],
				[d, d, c, c],
				[d, b, a, c]
			],
			//Ka
			[
				[c, d],
				[b, c]
			],
			//La
			[
				[c, d, c, d, a, b, a, b],
				[b, c, d, a, d, a, b, c],
				[c, b, a, d, a, d, c, b],
				[b, a, b, a, d, c, d, c],
				[a, b, a, b, c, d, c, d],
				[d, a, b, c, b, c, d, a],
				[a, d, c, b, c, b, a, d],
				[d, c, d, c, b, a, b, a]
			],
			//Ma
			[
				[c, d, a, b],
				[b, c, d, a]
			],

			// Quatrieme planche
			//Na
			[
				[b, d],
				[b, a]
			],
			//Oa
			[
				[a, c, d, c], // ...#hiiighway to hell#...
				[d, c, a, b]
			],
			//Pa
			[
				[a, b, c],
				[c, a, b],
				[b, c, a]
			],
			//Qa
			[
				[a, b, b, a, a, b],
				[d, d, c, d, c, c]
			],
			//Ra
			[
				[a, b, a, b, c, d, c, d],
				[d, c, d, c, b, a, b, a],
				[a, b, a, b, c, d, c, d],
				[d, c, d, c, b, a, b, a],
				[c, d, c, d, a, b, a, b],
				[b, a, b, a, d, c, d, c],
				[c, d, c, d, a, b, a, b],
				[b, a, b, a, d, c, d, c]
			],
			//Sa
			[
				[a, b, b, a, a, b],
				[d, d, c, d, c, c],
				[a, a, b, a, b, b],
				[d, c, c, d, d, c]
			],
			//Ta
			[
				[a, c, d],
				[d, c, a],
				[c, a, b],
				[b, a, c]
			],
			//Va
			[
				[a, b, a, b, c, d, c, d],
				[a, d, c, b, c, b, a, d]
			],
			//Ua  --> Slightly different to Truchet's original one, to avoid a bigger chunk than necessary
			[
				[a, b, c, d],
				[d, b, b, d],
				[d, c, b, a]
			],
			//Xa
			[
				[d, c, d, c, b, a, b, a],
				[a, c, d, b, c, a, b, d],
				[d, b, a, c, b, d, c, a],
				[a, b, a, b, c, d, c, d],
				[b, a, b, a, d, c, d, c],
				[c, a, b, d, a, c, d, b],
				[b, d, c, a, d, b, a, c],
				[c, d, c, d, a, b, a, b]
			],
			//Ya
			[
				[a, c, d, b, c, a, b, d],
				[a, b, a, b, c, d, c, d],
				[d, c, d, c, b, a, b, a],
				[a, c, d, b, c, a, b, d],
				[a, b, a, b, c, d, c, d],
				[d, c, d, c, b, a, b, a]
			],
			//Za
			[
				[c, c, d, d, a, a, b, b],
				[b, b, a, a, d, d, c, c],
				[c, a, b, d, a, c, d, b],
				[b, d, c, a, d, b, a, c]
			],

			//Cinquieme planche
			//Ab
			[
				[a, c, c, d, c, a],
				[c, c, a, a, b, a],
				[c, a, a, c, c, d],
				[b, a, c, c, a, a],
				[c, d, c, a, a, c],
				[a, a, b, a, c, c]
			],
			//Bb
			[
				[c, b, d, b, a, b, d, b],
				[b, d, b, a, b, d, b, c],
				[d, b, a, b, d, b, c, b],
				[b, a, b, d, b, c, b, d],
				[a, b, d, b, c, b, d, b],
				[b, d, b, c, b, d, b, a],
				[d, b, c, b, d, b, a, b],
				[b, c, b, d, b, a, b, d]
			],
			//Cb
			[
				[a, a, b, a, a, c, d, c],
				[a, c, c, d, c, c, a, b],
				[d, c, a, a, b, a, a, c],
				[a, b, a, c, c, d, c, c],
				[a, c, d, c, a, a, b, a],
				[c, c, a, b, a, c, c, d],
				[b, a, a, c, d, c, a, a],
				[c, d, c, c, a, b, a, c]
			],
			//Db
			[
				[c, a, d, b, c, a, b, d],
				[a, d, b, c, a, b, d, c],
				[d, b, c, a, b, d, c, a],
				[b, c, a, b, d, c, a, d],
				[c, a, b, d, c, a, d, b],
				[a, b, d, c, a, d, b, c],
				[b, d, c, a, d, b, c, a],
				[d, c, a, d, b, c, a, b]
			],
			//Eb
			[
				[a, c, d, b],
				[b, a, c, d],
				[d, b, a, c],
				[c, d, b, a]
			],
			//Fb
			[
				[c, a, d],
				[a, d, c],
				[d, c, a]
			],
			//Gb
			[
				[a, c, d, b],
				[b, d, c, a]
			],
			//Hb
			[
				[a, c, d, b],
				[d, b, a, c]
			],
			//Ib
			[
				[a, c, d, b, c, a, b, d],
				[d, b, a, c, b, d, c, a],
				[c, a, b, d, a, c, d, b],
				[b, d, c, a, d, b, a, c]
			],
			//Kb
			[
				[a, c, b, d],
				[c, a, d, b],
				[d, b, c, a],
				[b, d, a, c]
			],
			//Lb
			[
				[a, c, d, b],
				[c, a, b, d],
				[b, d, c, a],
				[d, b, a, c]
			],
			//Mb
			[
				[a, c, b, d, c, a, d, b],
				[c, a, d, b, a, c, b, d],
				[b, d, a, c, d, b, c, a],
				[d, b, c, a, b, d, a, c],
				[c, a, d, b, a, c, b, d],
				[a, c, b, d, c, a, d, b],
				[d, b, c, a, b, d, a, c],
				[b, d, a, c, d, b, c, a]
			],

			//Sixieme planche
			//Nb
			[
				[c, c, a, b],
				[b, b, a, c]
			],
			//Ob
			[
				[a, b, c, d],
				[c, a, a, c]
			],
			//Pb
			[
				[a, d, b, c],
				[d, b, c, b]
			],
			//Qb
			[
				[a, a, b, b, c, c, d, d],
				[c, d, c, d, a, b, a, b],
				[b, a, b, a, d, c, d, c],
				[c, c, d, d, a, a, b, b],
				[a, b, a, b, c, d, c, d],
				[d, c, d, c, b, a, b, a]
			],
			//Rb
			[
				[a, c, d, c, d, b],
				[c, a, c, d, b, d],
				[b, d, b, a, c, a],
				[d, b, a, b, a, c]
			],
			//Sb
			[
				[d, c, c, d],
				[b, a, b, a],
				[c, d, c, d],
				[b, a, a, b]
			],
			//Tb
			[
				[a, b, d],
				[c, a, b],
				[a, d, c]
			],
			//Vb
			[
				[b, b, c, d],
				[b, c, a, c]
			],
			//Ub
			[[a], [d, a, b, c], [d, d, b, b], [a, a, c, c], [a, d, c, b], [d]],
			//Xb
			[
				[a, c, d, b, c, a, b, d],
				[c, d, c, d, a, b, a, b],
				[b, a, b, a, d, c, d, c],
				[d, b, a, c, b, d, c, a],
				[c, a, b, d, a, c, d, b],
				[a, b, a, b, c, d, c, d],
				[d, c, d, c, b, a, b, a],
				[b, d, c, a, d, b, a, c]
			],
			//Yb
			[
				[d, d, b, a, b, a, c, c],
				[a, b, c, a, b, d, a, b],
				[c, a, d, c, d, c, b, d],
				[c, d, b, b, a, a, c, d],
				[b, a, c, c, d, d, b, a],
				[b, d, a, b, a, b, c, a],
				[d, c, b, d, c, a, d, c],
				[a, a, c, d, c, d, b, b]
			],
			//Zb
			[
				[a, c, b, a, d, b, c, a, d, c, b, d],
				[c, a, d, c, b, d, a, c, b, a, d, b],
				[d, b, a, b, a, c, b, d, c, d, c, a],
				[a, c, d, c, d, b, c, a, b, a, b, d],
				[b, d, a, b, c, a, d, b, c, d, a, c],
				[d, b, c, d, a, c, b, d, a, b, c, a],
				[c, a, d, c, b, d, a, c, b, a, d, b],
				[a, c, b, a, d, b, c, a, d, c, b, d],
				[b, d, c, d, c, a, d, b, a, b, a, c],
				[c, a, b, a, b, d, a, c, d, c, d, b],
				[d, b, c, d, a, c, b, d, a, b, c, a],
				[b, d, a, b, c, a, d, b, c, d, a, c]
			],

			//Septieme planche
			//Ac
			[
				[c, d, c, d, a, a, b, b],
				[b, b, a, a, d, c, d, c]
			],
			//Bc
			[
				[c, d, c, d, d, c],
				[b, d, c, a, b, a],
				[a, b, a, b, d, c],
				[d, b, a, c, b, a]
			],
			//Cc
			[
				[c, c, b, a, d, c, b, b],
				[b, a, d, d, a, a, d, c]
			],
			//Dc
			[
				[a, c, d, b, c, a, b, d],
				[b, a, b, a, d, c, d, c],
				[c, d, c, d, a, b, a, b],
				[d, b, a, c, b, d, c, a],
				[c, a, b, d, a, c, d, b],
				[d, c, d, c, b, a, b, a],
				[a, b, a, b, c, d, c, d],
				[b, d, c, a, d, b, a, c]
			],
			//Ec
			[
				[c, d, c, d, a, b, a, b],
				[b, d, a, a, d, b, c, c],
				[c, c, b, d, a, a, d, b],
				[b, a, b, a, d, c, d, c],
				[a, b, a, b, c, d, c, d],
				[d, b, c, c, b, d, a, a],
				[a, a, d, b, c, c, b, d],
				[d, c, d, c, b, a, b, a]
			],
			//Fc
			[
				[a, b, a, b, c, d, c, d],
				[b, d, c, a, d, b, a, c],
				[c, a, b, d, a, c, d, b],
				[d, c, d, c, b, a, b, a],
				[c, d, c, d, a, b, a, b],
				[d, b, a, c, b, d, c, a],
				[a, c, d, b, c, a, b, d],
				[b, a, b, a, d, c, d, c]
			],
			//Gc
			[
				[b, d, b, c, d, b, b, a],
				[c, d, a, b, a, d, a, d],
				[b, a, b, d, b, c, d, b],
				[a, d, c, d, a, b, a, d],
				[d, b, b, a, b, d, b, c],
				[a, d, a, d, c, d, a, b],
				[b, c, d, b, b, a, b, d],
				[a, b, a, d, a, d, c, d]
			],
			//Hc
			[
				[a, c, b],
				[d, a, b],
				[c, b, d],
				[a, c, d],
				[c, b, a],
				[a, b, d],
				[b, d, c],
				[c, d, a],
				[b, a, c],
				[b, d, a],
				[d, c, b],
				[d, a, c]
			],
			//Ic
			[
				[c, c, b, d],
				[a, a, b, d],
				[b, d, c, c],
				[b, d, a, a]
			],
			//Kc
			[
				[c, a, b],
				[d, c, a]
			],
			//Lc
			[
				[b, a, d, a, b, c],
				[a, b, b, b, a, a]
			],
			//Mc
			[
				[d, c, b, a],
				[d, c, b, a],
				[b, a, d, c],
				[b, a, d, c]
			],

			//Huitieme planche
			//Nc
			[
				[c, a, d, c, b, d],
				[a, c, a, b, d, b],
				[b, a, c, d, b, a],
				[c, d, b, a, c, d],
				[d, b, d, c, a, c],
				[b, d, a, b, c, a]
			],
			//Oc
			[
				[a, b, d, b, d, c, a, c],
				[d, c, a, c, a, b, d, b],
				[b, a, c, a, c, d, b, d],
				[d, c, a, c, a, b, d, b],
				[b, a, c, a, c, d, b, d],
				[c, d, b, d, b, a, c, a],
				[a, b, d, b, d, c, a, c],
				[c, d, b, d, b, a, c, a]
			],
			/*Fake oc. Variation of oc discovered by mistake. I like it.
            [[a, b, d, b, d, c],
             [d, c, a, c, a, b],
             [b, a, c, a, c, d],
             [d, c, a, c, a, b],
             [b, a, c, a, c, d],
             [c, d, b, d, b, a]],*/

			//Pc
			[
				[a, a, a, c, a, b, d, b, b, b],
				[a, a, c, a, c, d, b, d, b, b],
				[a, c, a, c, a, b, d, b, d, b],
				[c, a, c, a, a, b, b, d, b, d],
				[a, c, a, a, c, d, b, b, d, b],
				[d, b, d, d, b, a, c, c, a, c],
				[b, d, b, d, d, c, c, a, c, a],
				[d, b, d, b, d, c, a, c, a, c],
				[d, d, b, d, b, a, c, a, c, c],
				[d, d, d, b, d, c, a, c, c, c]
			],
			//Qc
			[
				[c, a, c, a, b, d, b, d, c, d],
				[a, c, a, c, d, b, d, b, a, b],
				[c, a, c, b, a, d, b, d, c, d],
				[a, c, d, c, d, c, d, b, a, b],
				[d, b, a, b, a, b, a, c, d, c],
				[b, d, b, c, d, a, c, a, b, a],
				[d, b, d, b, a, c, a, c, d, c],
				[b, d, b, d, c, a, c, a, b, a],
				[c, a, c, a, b, d, b, d, a, b],
				[b, d, b, d, c, a, c, a, d, c]
			],
			//Rc
			[
				[c, b, c, a, c, a, c, b],
				[a, c, a, d, b, d, a, c],
				[c, a, c, b, d, b, c, a],
				[b, d, a, c, a, c, a, d]
			],
			//Sc
			[
				[b, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c],
				[a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d],
				[c, b, d, b, d, c, a, c, a, d, b, d, b, a, c, a, c, b],
				[a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d],
				[c, b, d, b, d, c, a, c, a, d, b, d, b, a, c, a, c, b],
				[b, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c],
				[d, a, c, a, c, d, b, d, b, c, a, c, a, b, d, b, d, a],
				[b, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c],
				[d, a, c, a, c, d, b, d, b, c, a, c, a, b, d, b, d, a],
				[c, b, d, b, d, c, a, c, a, d, b, d, b, a, c, a, c, b],
				[a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d],
				[c, b, d, b, d, c, a, c, a, d, b, d, b, a, c, a, c, b],
				[a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d],
				[d, a, c, a, c, d, b, d, b, c, a, c, a, b, d, b, d, a],
				[b, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c],
				[d, a, c, a, c, d, b, d, b, c, a, c, a, b, d, b, d, a],
				[c, c, a, c, a, b, d, b, d, a, c, a, c, d, b, d, b, c],
				[a, d, b, d, b, a, c, a, c, b, d, b, d, c, a, c, a, d]
			],

			//Neuvieme planche
			//Tc
			[
				[a, b, a, b, a, b, c, d, c, d, c, d],
				[d, c, c, d, d, c, b, a, a, b, b, a],
				[a, c, a, b, d, b, c, a, c, d, b, d],
				[d, b, d, c, a, c, b, d, b, a, c, a],
				[a, b, b, a, a, b, c, d, d, c, c, d],
				[d, c, d, c, d, c, b, a, b, a, b, a],
				[c, d, c, d, c, d, a, b, a, b, a, b],
				[b, a, a, b, b, a, d, c, c, d, d, c],
				[c, a, c, d, b, d, a, c, a, b, d, b],
				[b, d, b, a, c, a, d, b, d, c, a, c],
				[c, d, d, c, c, d, a, b, b, a, a, b],
				[b, a, b, a, b, a, d, c, d, c, d, c]
			],
			//Vc
			[
				[c, a, b, a, b, d],
				[a, c, d, c, d, b],
				[d, b, c, d, a, c],
				[a, c, b, a, d, b],
				[d, b, a, b, a, c],
				[b, d, c, d, c, a]
			],
			//Uc
			[
				[c, d, b, a],
				[b, a, c, d],
				[c, d, a, b, d, c, a, b],
				[a, b, a, c, a, b, d, b],
				[a, b, c, d],
				[d, c, b, a],
				[d, c, d, b, d, c, a, c],
				[b, a, d, c, a, b, d, c],
				[c, d, b, a],
				[b, a, c, d],
				[c, d, a, b, d, c, a, b],
				[a, b, a, c, a, b, d, b],
				[a, b, c, d],
				[d, c, b, a],
				[d, c, d, b, d, c, a, c],
				[b, a, d, c, a, b, d, c]
			],
			//Xc
			[
				[a, b],
				[d, c],
				[a, c, a, b, d, b],
				[c, a, c, d, b, d],
				[b, a],
				[c, d],
				[b, d, b, a, c, a],
				[d, b, d, c, a, c]
			],
			//Yc
			[
				[c, d, a, b, d, c, a, b],
				[a, b, a, c, a, b, d, b],
				[c, d, c, a, c, d, b, d],
				[a, b, a, c, a, b, d, b],
				[d, c, d, b, d, c, a, c],
				[b, a, b, d, b, a, c, a],
				[d, c, d, b, d, c, a, c],
				[b, a, d, c, a, b, d, c],
				[c, d, b, a],
				[b, a, c, d]
			],
			//Zc
			[
				[a, c, a, c, a, b, d, b],
				[a, b, d, b, a, c, a, c],
				[c, d, b, d, c, a, c, a],
				[c, a, c, a, c, d, b, d]
			]
		];
		return int;
	}
}

function displayRuchet() {
	let t;
	t = new Truchet();
	let rules = t.createRules(0, 1, 2, 3);
	let rule = "";
	let current_zoom = 2;
	let zoom_f = 3;
	let largeurItem = w / 12;
	let buckets = largeurItem / zoom_f;
	let bucket = 10 * zoom_f;

	let current_rule = 0;
	current_rule = Math.floor(Math.random() * rules.length);
	let ruls = rules[current_rule];

	//TODO: Une fois que toutes les formes sont crées : fusionner en un seul motif (path)
	// compoundPath
	for (y = 0; y < buckets; y++) {
		for (x = 0; x < buckets * 1.5; x++) {
			let x_alpha = x * bucket;
			let y_alpha = y * bucket;
			let x_omega = x_alpha + bucket;
			let y_omega = y_alpha + bucket;
			let pattern_y = y % ruls.length;
			let r = ruls[pattern_y][x % ruls[pattern_y].length];

			let fillColor = colors.rose;

			switch (r) {
				case 0:
					triangle(
						x_alpha,
						y_alpha,
						x_omega,
						y_alpha,
						x_alpha,
						y_omega,
						fillColor
					);
					break;
				case 1:
					triangle(
						x_omega,
						y_alpha,
						x_omega,
						y_omega,
						x_alpha,
						y_alpha,
						fillColor
					);
					break;
				case 2:
					triangle(
						x_omega,
						y_omega,
						x_alpha,
						y_omega,
						x_omega,
						y_alpha,
						fillColor
					);
					break;
				case 3:
					triangle(
						x_alpha,
						y_omega,
						x_alpha,
						y_alpha,
						x_omega,
						y_omega,
						fillColor
					);
					break;
			}
		}
	}
}

function triangle(pt1_x, pt1_y, pt2_x, pt2_y, pt3_x, pt3_y, fillColor) {
	let path = new Path();
	path.add(new Point(pt1_x, pt1_y));
	path.add(new Point(pt2_x, pt2_y));
	path.add(new Point(pt3_x, pt3_y));

	path.fillColor = fillColor;
	//return path;
}
