let images_paths = {
	front: {
		custom: "assets/images/cards/${TYPE}/front/custom/${TEMPLATE_MODE}/${TEMPLATE}/${IMG_NAME}.png",
		header: "assets/images/cards/${TYPE}/front/headers/number_of_cards/${IMG_NAME}.png",
	},
	back: {
		logo: "assets/images/cards/${TYPE}/back/background/background.png",
	},
}

let templates = ['top', 'middle','bottom'];
let images_names = {
	gapped: {
		random: {
			top: ['QT_D-2', '2', '3'],
			middle: ['1'],
			bottom: ['1','2'],
		},
		categories: {
			top: ['TO_DO'],
			middle: ['TO_DO'],
			bottom: ['TO_DO'],
		},
	},
	completion: {
		random: {
			top: ['1', '2', '3'],
			middle: ['1'],
			bottom: ['1','2'],
		},
		categories: {
			top: ['TO_DO'],
			middle: ['TO_DO'],
			bottom: ['TO_DO'],
		},
	},
};
function getBackgroundUrlAndTemplate(card) {
	let output = {
		position: undefined,
		background_path: undefined,
	};
	let template_mode;
	let image_name;
	let images_possibilities;
	let image_path = images_paths.front.custom.replace('${TYPE}', card.type);
	if (card.details.template === null) {
		template_mode = 'random';
		image_path = image_path.replace('${TEMPLATE_MODE}', template_mode);
		template = templates[Math.floor(Math.random() * templates.length)];
		image_path = image_path.replace('${TEMPLATE}', template);
		images_possibilities = images_names[card.type][template_mode][template];
		image_name = images_possibilities[Math.floor(Math.random() * images_possibilities.length)];
		image_path = image_path.replace('${IMG_NAME}', image_name);
		output.position = template;
		output.background_path = image_path;
	} else {
		template_mode = 'categories';
		image_path = image_path.replace('${TEMPLATE_MODE}', template_mode);
		image_path = image_path.replace('${TEMPLATE}', card.details.template);
		images_possibilities = images_names[card.type][template_mode][template];
		image_name = images_possibilities[Math.floor(Math.random() * images_possibilities.length)];
		image_path = image_path.replace('${IMG_NAME}', image_name);
		// image_path = image_path.replace('${IMG_NAME}', card.details.category);
		output.position = card.details.template;
		output.background_path = image_path;
	}
	return output;
}
function formatFrontCard(card) {
	let html_number_cards;
	// SI CARTE A TROU AVEC NOMBRE DE TROU DIFFERENT DU NOMBRE DE CARTE A DONNER, ALORS IL FAUT UNE PRECISION SUPPLEMENTAIRE SUR LA CARTE
	if (card.type == "gapped") {
		if (card.details.is_implicite) {
			let gaps = card.details.gaps;
			gaps = '1';
			let image_header_url = images_paths.front.header.replace('${TYPE}', card.type).replace('${IMG_NAME}',gaps);
			html_number_cards = `
			<div class="card-front-header-left">
				<img class="img-block" src="${image_header_url}">
			</div>
			`;
		}
	}
		let template_data = getBackgroundUrlAndTemplate(card);
	html = `
		<div class="card" type="${card.type}" style= "background-image: url(${template_data.background_path})">
			<div class="card-front-header-container">
				${html_number_cards || ''}
			</div>
			<div class="card-front-content-container" position="${template_data.position}" type="${card.type}">
      			<div class="card-front-content" type="${card.type}" position="${template_data.position}">
						${card.content}
				</div>
			</div>
		</div>
	`;
	return html;
}

function formatBackCard(card) {
	let background_path = 
	html = `
		<div class="card" type="${card.type}" side="back" style= "background-image: url(${images_paths.back.logo.replace('${TYPE}', card.type)})"> 
		</div>
	`
;
return html;
}

function formatCardsHtml(json_cards) {
	let cards_html = {
		"completion": {
			"front": [],
			"back": [],
		},
		"gapped": {
			"front": [],
			"back": [],
		},
	}
	let html = '';
	// COMPLETION CARDS
	if (json_cards.gapped) {
		let gapped_cards = json_cards.gapped["1"].concat(json_cards.gapped["2"]).concat(json_cards.gapped["3"])
		for (let card of gapped_cards) {
			cards_html.gapped.front.push(formatFrontCard(card));
			cards_html.gapped.back.push(formatBackCard(card));
		}
	}
	if (json_cards.completion) {
		for (let card of json_cards.completion) {
			cards_html.completion.front.push(formatFrontCard(card));
			cards_html.completion.back.push(formatBackCard(card));
		}
	}
	return cards_html;
}

let print_config = {
	cards_by_page: {
		gapped: 6,
		completion: 8,
	},
};
function outputHtml(cards_html) {
	getPrintableHtml = function(cards, type) {
		let cbp = print_config.cards_by_page[type];
		let html = "";
		let html_cards_only;
		let html_pages = '';
		let len = Math.ceil(cards.front.length / cbp);
		//len = 1;
		const reducer = (a,b) => a+b;
		let html_blank_cards;
		for (i = 0; i < len; i++) {
			html_cards_only_front = cards.front.slice(i*cbp,i*cbp+cbp).reduce(reducer);
			html_pages += `
				<div class="page" size="A4">
					<div class="subpage" size="A4">
						${html_cards_only_front}
					</div>
				</div>
			`;
			html_cards_only_back = cards.back.slice(i*cbp,i*cbp+cbp).reduce(reducer);
			html_pages += `
				<div class="page" size="A4">
					<div class="subpage" size="A4">
						${html_cards_only_back}
					</div>
				</div>
			`;
		}
		return html_pages;
	}
	let html = getPrintableHtml(cards_html.gapped, 'gapped');
	html += getPrintableHtml(cards_html.completion, 'completion');
	document.getElementById('deck').innerHTML = html;
}

function init() {
	if (json_cards) {
		cards_html = formatCardsHtml(json_cards);
		outputHtml(cards_html);
		let all_content_divs = document.getElementsByClassName('card-front-content');
		for (let div of all_content_divs) {
			//div.innerHTML = 'VOICI UN TEXTE BEAUCOUP TROP LONG QUI NE DEVRAIT PAS TENIR DANS LA DIV,VOICI UN TEXTE BEAUCOUP TROP LONG QUI NE DEVRAIT PAS TENIR DANS LA DIV, VOICI UN TEXTE BEAUCOUP TROP LONG QUI NE DEVRAIT PAS TENIR DANS LA DIV, VOICI UN TEXTE BEAUCOUP TROP LONG QUI NE DEVRAIT PAS TENIR DANS LA DIV'
			let max_size = getComputedStyle(div.parentNode).getPropertyValue('--initial-height');
			if (max_size !== '') {
				adaptFontSize(div, Math.floor(parseFloat(max_size)), true);
			}
		}
	}
}

function adaptFontSize(div, max_size, init = false) {
	if (!init) {
		div.style.fontSize = String(parseFloat(getComputedStyle(div).getPropertyValue('font-size')) - 1) + 'px';
	}
	console.log(getComputedStyle(div).getPropertyValue('font-size'))
	if ( Math.floor(div.parentNode.clientHeight) > max_size) {
		if (init) {
			console.log('SIZE CHANGE : ', div.innerHTML);
		}
		
		adaptFontSize(div, max_size, false);
	}
}
init();
//window.print()

`
	PRINCIPE DE RECURRENCE: POSSIBILITE D AJOUTER PLUSIEURS FOIS LA MEME CARTE
	SUGGESTION: CARTE TEMPLATE A PROPOSER A L UTILISATEUR DIRECTEMENT POUR QU IL RAJOUTE UN PRENOM
	CARTE TROU: PYTHON: FAIRE REMONTER ELEMENT SI NOMBRE DE TROU DIFFERENTS DE NOMBRE DE SIGNE TROU
	CARTE TOU: JS: AFFICHER UNE ICONE INDIQUANT D UTILISER LE NOMBRE DE CARTE SI IMPLICITE

	CARTE BONUS: DIFFERENTE, CATEGORIE UNIQUE, A VOIR PLUS TARD

	IDEE DE NOMS:
	GOODBYE BUDDY
`