
(function(){
	const TRANSITION_CLASS_EXIT = 'page-exit';
	const TRANSITION_CLASS_ENTER = 'page-enter';

		document.addEventListener('DOMContentLoaded', ()=>{
			const dir = sessionStorage.getItem('page-transition-direction');
			if (dir === 'left') {
				document.body.classList.add(TRANSITION_CLASS_ENTER, 'page-enter-left');
			} else if (dir === 'right') {
				document.body.classList.add(TRANSITION_CLASS_ENTER, 'page-enter-right');
			} else {
				document.body.classList.add('no-enter');
			}
			sessionStorage.removeItem('page-transition-direction');
		if (!document.querySelector('.page-slide-wrapper')) {
			const wrapper = document.createElement('div');
			wrapper.className = 'page-slide-wrapper';
			while (document.body.firstChild) {
				wrapper.appendChild(document.body.firstChild);
			}
			document.body.appendChild(wrapper);
		}
		requestAnimationFrame(()=> requestAnimationFrame(()=>{
			document.body.classList.add('active');
			document.body.classList.add('revealed');
		}));
	});

	function shouldIntercept(link) {
		if (!link || !link.href) return false;
		const origin = location.origin || (location.protocol + '//' + location.host);
		if (!link.href.startsWith(origin)) return false;
		if (link.target && link.target !== '' && link.target !== '_self') return false;
		return true;
	}

	document.addEventListener('click', (e)=>{
		const a = e.target.closest && e.target.closest('a');
		if (!a) return;
		if (!a.classList.contains('link-transition') && !a.dataset.transition) return;
		if (!shouldIntercept(a)) return;

		e.preventDefault();
		const href = a.href;
		const dir = a.dataset.direction || null;
		if (dir) sessionStorage.setItem('page-transition-direction', dir);

		document.body.classList.remove(TRANSITION_CLASS_ENTER);
		document.body.classList.add(TRANSITION_CLASS_EXIT);
		if (dir === 'right') document.body.classList.add('page-exit-right');
		else if (dir === 'left') document.body.classList.add('page-exit-left');

		const wrapper = document.querySelector('.page-slide-wrapper');
		const done = ()=> { location.href = href; };
		const fallback = setTimeout(done, 680);
		if (wrapper) {
			wrapper.addEventListener('transitionend', function te(ev){
				if (ev.propertyName === 'transform' || ev.propertyName === 'opacity') {
					clearTimeout(fallback);
					wrapper.removeEventListener('transitionend', te);
					done();
				}
			});
		}
	}, {capture: true});
})();
