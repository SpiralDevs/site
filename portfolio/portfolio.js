function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'block';
    window.location.hash = modalId.replace('modal-', '');
}

function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    history.pushState("", document.title, window.location.pathname);
}

function htmlToParagraphs(text) {
    if (!text) return [];

    let normalized = String(text).replace(/\r\n|\n/g, '<br>');

    normalized = normalized.replace(/<br\s*\/?>/gi, '<br>');

    const parts = normalized.split(/(?:<br>\s*){2,}/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    return parts;
}


function renderProjects(projects) {
    const container = document.getElementById('portfolio');
    if (!container) return;

    const featured = projects.filter(p => p.tags?.includes("Featured"));
    const regular = projects.filter(p => !p.tags?.includes("Featured"));

    let activeTag = null; // currently selected tag (null = no filter)
    let featuredHeaderEl = null;
    let featuredSectionEl = null;

    function applyFilter() {
        // Show/hide projects based on activeTag
        const allCards = container.querySelectorAll('.project');
        allCards.forEach(card => {
            const tags = (card.dataset.tags || '').split('|').filter(Boolean);
            if (!activeTag) {
                card.style.display = ''; // let CSS determine display (flex)
            } else {
                card.style.display = tags.includes(activeTag) ? '' : 'none';
            }
        });

        // If featured section exists, hide it if none of its project cards are visible
        if (featuredSectionEl) {
            const featuredCards = Array.from(featuredSectionEl.querySelectorAll('.project'));
            const anyVisible = featuredCards.some(c => c.style.display !== 'none');
            if (!anyVisible) {
                featuredHeaderEl.style.display = 'none';
                featuredSectionEl.style.display = 'none';
            } else {
                featuredHeaderEl.style.display = '';
                featuredSectionEl.style.display = '';
            }
        }
    }

    function createProjectCard(project) {
        const modalId = 'modal-' + project.id.toLowerCase();
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project';

        // store tags on the card for quick lookup (lowercase for consistent matching)
        projectDiv.dataset.tags = (project.tags || []).map(t => t).join('|');

        if (project.tags?.length) {
            const tagContainer = document.createElement('div');
            tagContainer.className = 'tag-container';
            project.tags.forEach(tag => {
                const tagBtn = document.createElement('button');
                tagBtn.className = 'tag-btn';
                tagBtn.textContent = tag;
                tagBtn.addEventListener('click', () => {
                    // toggle active tag
                    if (activeTag === tag) {
                        activeTag = null;
                    } else {
                        activeTag = tag;
                    }
                    // update visual state of all tag buttons
                    document.querySelectorAll('.tag-btn').forEach(b => {
                        b.classList.toggle('active', b.textContent === activeTag);
                    });
                    applyFilter();
                });
                tagContainer.appendChild(tagBtn);
            });
            projectDiv.appendChild(tagContainer);
        }

        if (project.source) {
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.dataset.modal = modalId;
            expandBtn.textContent = 'Learn More';
            projectDiv.appendChild(expandBtn);

            const img = document.createElement('img');
            img.src = project.source;
            img.alt = project.title || 'Project Image';
            projectDiv.appendChild(img);
        }

        const content = document.createElement('div');
        content.className = 'project-content';
        if (project.id) content.id = project.id;

        const h2 = document.createElement('h2');
        h2.textContent = project.title || '';
        content.appendChild(h2);

        if (project.short_description) {
            const parts = htmlToParagraphs(project.short_description);
            parts.forEach(pHtml => {
                const p = document.createElement('p');
                p.innerHTML = pHtml;
                content.appendChild(p);
            });
        }

        projectDiv.appendChild(content);

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'project-buttons';
        (project.links || []).filter(l => l.about_section === false).forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.className = 'button';
            a.textContent = link.text;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            buttonsDiv.appendChild(a);
        });
        if (buttonsDiv.children.length) projectDiv.appendChild(buttonsDiv);

        // Modal
        const hasModalContent = (project.description && project.description.trim()) || (project.links && project.links.length);
        if (project.source || hasModalContent) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = modalId;

            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.textContent = 'Close';
            modalContent.appendChild(closeBtn);

            const modalText = document.createElement('div');
            modalText.className = 'modal-text';

            const mh2 = document.createElement('h2');
            mh2.textContent = project.title || '';
            modalText.appendChild(mh2);

            const descSource = project.description || project.short_description || '';
            const descParts = htmlToParagraphs(descSource);
            descParts.forEach(pHtml => {
                const p = document.createElement('p');
                p.innerHTML = pHtml;
                modalText.appendChild(p);
            });

            modalContent.appendChild(modalText);

            const modalButtonsDiv = document.createElement('div');
            modalButtonsDiv.className = 'project-buttons';
            const aboutLinks = (project.links || []).filter(l => l.about_section === true);
            const linksToShow = aboutLinks.length ? aboutLinks : (project.links || []);
            linksToShow.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.className = 'button';
                a.textContent = link.text;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                modalButtonsDiv.appendChild(a);
            });
            if (modalButtonsDiv.children.length) modalContent.appendChild(modalButtonsDiv);

            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        }

        return projectDiv;
    }

    // Clear container
    container.innerHTML = '';

    // Featured Section (only create if there are featured projects)
    if (featured.length > 0) {
        featuredHeaderEl = document.createElement('h2');
        featuredHeaderEl.textContent = 'Featured Projects';
        featuredHeaderEl.className = 'section-header';
        container.appendChild(featuredHeaderEl);

        featuredSectionEl = document.createElement('div');
        featuredSectionEl.className = 'featured-section';
        featured.forEach(p => featuredSectionEl.appendChild(createProjectCard(p)));
        container.appendChild(featuredSectionEl);
    }

    // Other Projects Section
    const otherHeader = document.createElement('h2');
    otherHeader.textContent = 'Other Projects';
    otherHeader.className = 'section-header';
    container.appendChild(otherHeader);

    const otherGrid = document.createElement('div');
    otherGrid.className = 'other-grid';
    regular.forEach(p => otherGrid.appendChild(createProjectCard(p)));
    container.appendChild(otherGrid);

    // remove clear filters button — user requested no clear button

    // Event Listeners for modals
    document.querySelectorAll('.expand-btn').forEach(button => {
        button.addEventListener('click', function () {
            showModal(this.dataset.modal);
        });
    });
    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', function () {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // initial filter state (none)
    applyFilter();

    // expose filter state function if needed (optional)
    window.getActivePortfolioFilter = () => activeTag;
}



window.addEventListener('load', function () {
    fetch('projects.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load projects.json');
            return res.json();
        })
        .then(data => {
            renderProjects(data.projects || []);
            const hash = window.location.hash.substring(1);
            if (hash) {
                const modalId = 'modal-' + hash;
                const modal = document.getElementById(modalId);
                if (modal) showModal(modalId);
            }
        })
        .catch(err => {
            console.error('Error loading projects:', err);
        });
});
