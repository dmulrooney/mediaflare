function removeElement(elementId) {
	// Removes an element from the document
	try {
		var element = document.getElementById(elementId);
		element.parentNode.removeChild(element);
	} catch(e) {
		console.log("Failed to remove element.");
	}
}

function listToMatrix(list, elementsPerSubArray) {
	var matrix = [],
		i, k;
	for (i = 0, k = -1; i < list.length; i++) {
		if (i % elementsPerSubArray === 0) {
			k++;
			matrix[k] = [];
		}
		matrix[k].push(list[i]);
	}
	return matrix;
}

var createElement = function(tagName, id, attrs, events) {
	attrs = Object.assign(attrs || {}, {
		id: id
	});
	events = Object.assign(events || {});

	var el = document.createElement(tagName);
	Object.keys(attrs).forEach((key) => {
		if (attrs[key] !== undefined) {
			el.setAttribute(key, attrs[key]);
		}
	});

	Object.keys(events).forEach((key) => {
		if (typeof events[key] === 'function') {
			el.addEventListener(key, events[key]);
		}
	});

	return el;
}

function ready() {
	try {
		try {
			var jdata = JSON.parse(document.getElementsByClassName("content style-scope ytd-video-secondary-info-renderer")[0].innerText);
		} catch (e) {
			console.log(e);
			return false;
		}
		var keys = jdata['keys'];
		try {
			var titleElm = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0];
			var title = jdata['title'];
			titleElm.innerText = title;
			document.title = title;
			var filters = jdata['filter'];
			var audio = jdata['audio'];
			var desc = jdata['desc'];
			var rate = jdata['rate'];
		} catch (e) {
			//alert(e);
			var title = titleElm.innerText; // remain same
			var filters = false;
			var audio = false;
			var desc = "";
			var rate = 1;
		}
		try {
			video.pause();
			document.getElementsByClassName("ytp-settings-button")[0].click();
			document.getElementsByClassName("ytp-settings-button")[0].click();
			document.getElementsByClassName("ytp-menuitem-label")[document.getElementsByClassName("ytp-menuitem-label").length - 1].click();
			var maxQuality = document.getElementsByClassName("ytp-popup ytp-settings-menu")[0].getElementsByClassName("ytp-menuitem")[0].innerText.split(" ")[0];
			if (maxQuality == "4320p") {
				document.getElementsByClassName("ytp-popup ytp-settings-menu")[0].getElementsByClassName("ytp-menuitem")[3].click();
			} else if (maxQuality == "2160p") {
				document.getElementsByClassName("ytp-popup ytp-settings-menu")[0].getElementsByClassName("ytp-menuitem")[2].click();
			} else if (maxQuality == "1440p") {
				// Select 1080p for slower users, they can preselect 1440p later in settings.
				document.getElementsByClassName("ytp-popup ytp-settings-menu")[0].getElementsByClassName("ytp-menuitem")[1].click();
			} else {
				console.log("Selected highest quality available.");
				document.getElementsByClassName("ytp-popup ytp-settings-menu")[0].getElementsByClassName("ytp-menuitem")[0].click();
			}

			setTimeout(function() {
				video.playbackRate = rate;
				video.play();
			}, 10);
		} catch (e) {
			console.log(e);
		}
		ud = get_url(maxQuality)
		document.getElementsByClassName("content style-scope ytd-video-secondary-info-renderer")[0].innerHTML = "";
		document.getElementsByClassName("content style-scope ytd-video-secondary-info-renderer")[0].appendChild(createElement('p', 'descriptionend'));
		desc += "<p>--------------------------------------------<p><p> Can you help mediaflare?</p><p>--------------------------------------------<p></br></p>Please reupload this video and help others access this content for free:</p>"
		desc += "<center></br><p><a href=\"" + ud[0] + "\" download='" + title.replace(/ /g, "_") + "_video.mp4' target=\"_blank\" type='" + ud[1] + "'>Click here to download the video</a></p>";
		desc += "<p><a href=\"" + ud[2] + "\" download='" + title.replace(/ /g, "_") + "_audio.webm' target=\"_blank\" type='" + ud[3] + "'>Click here to download the audio</a></p></center></br>";
		document.getElementById('descriptionend').innerHTML = desc;
	} catch (e) {
		console.log(e);
		throw new Error("Failed to read metadata in description.");
	}

	setTimeout(function() {
		try {
			var duration = Math.floor(video.duration);
			var cw = video.videoWidth;
			var ch = video.videoHeight;
			if (cw == undefined || ch == undefined || cw < 90 || ch < 90) { console.log("ERROR: Video height needs retry?"); return false; }
			video.parentElement.style = "visibility: hidden;";

			if (filters) {
				filter = {
					'class': 'view',
					'height': '100%',
					'width': '100%',
					'style': 'outline-style:none; user-select: none; filter: invert(100%) hue-rotate(-90deg); transform: scale(-1);'
				};
			} else {
				filter = {
					'class': 'view',
					'height': '100%',
					'width': '100%',
					'style': 'outline-style:none; user-select: none;'
				};
			}
			video.parentElement.parentElement.appendChild(createElement('center', 'centered', {'style': 'outline-style:none; user-select: none;'}));
			document.getElementById('centered').appendChild(createElement('canvas', 'ctx', filter));
			video.parentElement.parentElement.appendChild(createElement('canvas', 'canvas', {
				'style': 'visibility: hidden;'
			}));

			var canvas = document.getElementById('canvas');
			var canvas2 = document.getElementById('ctx');
			var context = canvas.getContext('2d', {
				alpha: false
			});
			var ctx = canvas2.getContext('2d', {
				alpha: false
			});
			var lastTime = -1;
			var lastHeight = -1;

			canvas2.width = cw;
			canvas2.height = ch;
			canvas.width = cw;
			canvas.height = ch;
		} catch (e) {
			console.log(e);
			throw new Error("Not a compatiable website.");
		}


		if (keys.indexOf(keys.length) != -1) {
			var nkeys = [];
			keys.forEach(function(element) {
				nkeys.push(element - 1);
			});
			keys = nkeys;
		}
		var rclen = Math.sqrt(keys.length);
		var items = listToMatrix(keys, rclen)
		tileWidth = cw / rclen;
		tileHeight = ch / rclen;

		klist = [];
		var row;
		var col;
		for (row = 0; row < rclen; row++) {
			for (col = 0; col < rclen; col++) {
				klist.push([col, row]);
			}
		}

		function draw() {
			if (video.currentTime !== lastTime) {
				var vidHeight = video.style.height;
				if (vidHeight < 90 || lastHeight != vidHeight) {
					lastHeight = vidHeight;
					canvas2.style.height = lastHeight;
					canvas2.style['margin-top'] = video.style.top;
				}
				context.drawImage(video, 0, 0, cw, ch, 0, 0, cw, ch);
				var row;
				var col;
				var current = 0;
				for (row = 0; row < rclen; row++) {
					for (col = 0; col < rclen; col++) {
						try {
							//var imageData = context.getImageData(tileWidth * col, tileHeight * row, tileWidth, tileHeight);
							//ctx.putImageData(imageData, tileWidth * klist[keys[current]][0], tileHeight * klist[keys[current]][1]);
							var kdata = klist[keys[current]];
							ctx.drawImage(canvas, tileWidth * col, tileHeight * row, tileWidth, tileHeight, tileWidth * kdata[0], tileHeight * kdata[1], tileWidth, tileHeight);         // draw canvas A
							current++;
							lastTime = video.currentTime;
						} catch (e) {
							console.log(e);
							return;
						}
					}
				}
			}
			requestAnimationFrame(draw);
		};
		draw();


		setInterval(function() {
			if (!video.paused && video.videoWidth > 90 && video.videoHeight > 90 && engineRunning) {
				cw = video.videoWidth;
				ch = video.videoHeight;
				tileWidth = cw / rclen;
				tileHeight = ch / rclen;
				canvas2.width = cw;
				canvas2.height = ch;
				canvas.width = cw;
				canvas.height = ch;
				if (duration != undefined && Math.floor(video.duration) != duration) {
					try {
						removeElement('canvas');
						removeElement('ctx');
					} catch(e) {
						console.log(e);
						console.log("Failed to REMOVE canvas DOM.");
					}
					video.parentElement.style = "visibility: visible;";
					// Reset params
					video.playbackRate = 1;
					document.getElementById('descriptionend').innerHTML = ""; // clear description
					setInterval(function() {
						try {
							titleElm.innerText = document.getElementsByClassName('ytp-title-link yt-uix-sessionlink ytp-title-fullerscreen-link')[0].innerText;
						} catch (e) {
							console.log(e);
						}
					}, 1080);
					engineRunning = false;
					throw new Error("The video appears to have changed. " + duration + " vs " + video.duration);
				}
			} else {
				if (lastHeight != video.style.height) {
					lastHeight = video.style.height;
					canvas2.style.height = lastHeight;
					canvas2.style['margin-top'] = video.style.top;
				}
			}
		}, 1600);

		var container = video.parentElement.parentElement.parentElement;
		container.onclick = function() {
			var noRedirect = '.view';
			if (event.target.matches(noRedirect) || event.target.id == "centered") {
				if (!video.paused) {
					video.pause();
				} else {
					video.play();
				}
			} else {
				console.log(event.target)
			}
		}
	}, 480);
	return true;
}
var engineRunning = true;
var video = document.querySelector('video');
$(document).ready(function() {
	setTimeout(function() {
		try {
			document.getElementsByClassName('dropdown-trigger style-scope ytd-menu-renderer')[0].style = "display: none;";
		} catch (e) {}
	}, 100);
	setTimeout(function() {
		var success = ready();
		if (!success) {
			console.log("Retrying ready() command!");
			setTimeout(function() {
				success = ready();
				if(!success) {
					console.log("Failed twice! Giving up.");
				} else {
					console.log("Succeeded second time!");
				}
			}, 1100);
		} else {
			console.log("Successfully executed ready() command!");
		}
	}, 950);
});


function get_url(quality) {
	var str = document.getElementById("player").getElementsByTagName('script')[1].innerText;
	var new1 = str.split(";ytplayer.load");
	var new2 = new1[0].replace(/ytplayer/g, 'vtplayer');
	try {
		eval(new2);
		console.log(vtplayer);
	} catch (e) {
		console.log(e);
	}
	// ES6 version
	const videoUrls = vtplayer.config.args.adaptive_fmts
		.split(',')
		.map(item => item
			.split('&')
			.reduce((prev, curr) => (curr = curr.split('='),
				Object.assign(prev, {
					[curr[0]]: decodeURIComponent(curr[1])
				})
			), {})
		)
		.reduce((prev, curr) => Object.assign(prev, {
			[curr.quality_label || curr.type]: curr
		}), {});
	var url = videoUrls[quality]["url"];
	var audioType = Object.keys(videoUrls)[Object.keys(videoUrls).length - 1];
	var audio = videoUrls[audioType]["url"];
	console.log([url, videoUrls[quality]["type"], audio, audioType])
	return [url, videoUrls[quality]["type"], audio, audioType];
}
