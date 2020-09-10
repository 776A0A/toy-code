var elementDefinations = Array.prototype.map.call(
	document.querySelectorAll('.element'),
	e => ({
		text: e.innerText,
		name: e.childNodes[0].childNodes[0].id.match(/the\-([\s\S]+)\-element:/)
			? RegExp.$1
			: null
	})
)

for (let defination of elementDefinations) {
	let categories = defination.text
		.match(
			/Categories:\n([\s\S]+)\nContexts in which this element can be used:/
		)[1]
		.split('\n')
	defination.categories = []
	for (let category of categories) {
		if (category.match(/^([^ ]+) content./))
			defination.categories.push(RegExp.$1)
		else console.log(category)
	}

	/*
  let contentModel = defination.text.match(/Content model:\n([\s\S]+)\nTag omission in text\/html:/)[1].split("\n");
  for(let line of contentModel)
    console.log(line);
*/
}
