const App = {
    data: {
        syllabus: {},
        subjects: [],
        activeSubject: null,
        activeQuestions: [],
        currentQIndex: 0,
        sessionStats: { correct: 0, wrong: 0, total: 0 }
    },

    colors: ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--p4)', 'var(--p5)', 'var(--p6)', 'var(--p7)'],

    init() {
        this.fetchData();
    },

    async fetchData() {
        try {
            const sylRes = await fetch('data/syllabus.json');
            this.data.syllabus = await sylRes.json();
            this.data.subjects = Object.keys(this.data.syllabus).sort();
            this.populateSubjectSelector();
            
            // Auto load first subject if none selected
            if(this.data.subjects.length > 0) {
                document.getElementById('subject-select').value = this.data.subjects[0];
                this.loadSubject(this.data.subjects[0]);
            }
        } catch(e) {
            console.error("Error fetching syllabus:", e);
        }
    },

    populateSubjectSelector() {
        const select = document.getElementById('subject-select');
        select.innerHTML = '<option value="">Select a Subject...</option>' +
            this.data.subjects.map(s => `<option value="${s}">${s.toUpperCase()}</option>`).join('');
    },

    async loadSubject(subject) {
        if(!subject) return;
        this.data.activeSubject = subject;
        document.getElementById('subject-title').innerText = subject.toUpperCase();
        
        try {
            const req = await fetch(`data/${subject}.json`);
            this.data.activeQuestions = await req.json();
        } catch(e) {
            console.error("Error fetching questions for", subject);
            this.data.activeQuestions = [];
        }

        this.updateTelemetry();
        this.renderDashboard();
    },

    updateTelemetry() {
        const topics = this.data.syllabus[this.data.activeSubject] || [];
        const numQ = this.data.activeQuestions.length;

        document.getElementById('stat-pillars').innerText = topics.length > 7 ? 7 : topics.length;
        document.getElementById('stat-submodules').innerText = topics.length;
        document.getElementById('stat-questions').innerText = numQ;

        // Mock stats for aesthetic
        document.getElementById('stat-cases').innerText = Math.floor(numQ / 4);
        document.getElementById('stat-cbme').innerText = Math.floor(topics.length * 1.5);
        document.getElementById('stat-facts').innerText = (numQ * 4) + 112;
    },

    renderDashboard() {
        document.getElementById('dashboard-section').style.display = 'block';
        document.getElementById('quiz-section').style.display = 'none';

        this.renderHubSVG();
        this.renderPillars();
        this.renderCrossPillar();
        this.renderCaseChains();
        this.renderDrugMap();
        this.renderSpeedRef();
    },

    getPillarColor(index) {
        return this.colors[index % this.colors.length];
    },

    renderHubSVG() {
        const topics = this.data.syllabus[this.data.activeSubject] || [];
        const numNodes = Math.min(topics.length, 10); // cap for visual sanity
        const cx = 470;
        const cy = 300;
        const r = 200;

        let svg = `<svg viewBox="0 0 940 620" width="100%" height="400px" style="max-width:100%;">`;

        // Hub
        svg += `<circle cx="${cx}" cy="${cy}" r="74" fill="url(#hubGrad)" stroke="#4a4a70" stroke-width="2"/>`;
        svg += `<text x="${cx}" y="${cy+5}" text-anchor="middle" fill="#fff" font-family="var(--serif)" font-size="20px">${this.data.activeSubject.substring(0,3).toUpperCase()}</text>`;

        // Definitions
        svg += `<defs>
            <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#3a3a5c" />
                <stop offset="100%" stop-color="#16162a" />
            </radialGradient>
        </defs>`;

        // Nodes and links
        let nodes = [];
        for(let i=0; i<numNodes; i++) {
            const angle = (i / numNodes) * Math.PI * 2 - (Math.PI / 2);
            const nx = cx + r * Math.cos(angle);
            const ny = cy + r * Math.sin(angle);
            nodes.push({x: nx, y: ny, color: this.getPillarColor(i), title: topics[i]});
        }
        
        // Draw cross lines (fake differential web)
        for(let i=0; i<nodes.length; i++) {
            for(let j=i+1; j<nodes.length; j+=2) {
                 svg += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="#2b2b42" stroke-width="1.3" />`;
            }
        }

        // Draw radial lines & nodes
        nodes.forEach((n, i) => {
            svg += `<line x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}" stroke="${n.color}" stroke-width="2" opacity="0.6"/>`;
            svg += `<circle cx="${n.x}" cy="${n.y}" r="46" fill="#14141f" stroke="${n.color}" stroke-width="2.5" />`;

            // Abbreviate text
            const words = n.title.split(' ');
            const t1 = words[0] ? words[0].substring(0,7) : '';
            svg += `<text x="${n.x}" y="${n.y+4}" text-anchor="middle" fill="#e6eaf0" font-family="var(--sans)" font-size="11px">${t1}</text>`;
        });

        svg += `</svg>`;
        document.getElementById('hub-container').innerHTML = svg;
    },

    renderPillars() {
        const topics = this.data.syllabus[this.data.activeSubject] || [];
        let html = '';

        topics.forEach((topic, i) => {
            // Count questions for this topic
            const qCount = this.data.activeQuestions.filter(q => q.topic === topic).length;
            const color = this.getPillarColor(i);

            html += `
                <div class="pcard" role="button" tabindex="0" style="border-top-color: ${color}" onclick="App.startQuiz('${topic}')" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); App.startQuiz('${topic}'); }">
                    <h3>${topic}</h3>
                    <div class="quote">"Pathogenesis drives presentation"</div>
                    <div class="chips">
                        <span class="chip">Key Concepts</span>
                        <span class="chip">Diagnostics</span>
                        <span class="chip">Management</span>
                    </div>
                    <div class="meta">
                        <span>${qCount} MCQs</span>
                        <span>CH-${i+1}</span>
                        <span>CBME 1.${i}</span>
                    </div>
                </div>
            `;
        });

        document.getElementById('pillars-grid').innerHTML = html;
    },

    renderCrossPillar() {
        const topics = this.data.syllabus[this.data.activeSubject] || [];
        let html = '';

        // Generate mock differential data
        for(let i=0; i<Math.min(topics.length-1, 5); i++) {
            const isCert = i % 2 === 0 ? 'certifiable' : '';
            const mark = isCert ? '<mark>CERTIFIABLE</mark>' : '';
            html += `
                <tr class="${isCert}">
                    <td class="index">${i+1}</td>
                    <td>Differential ${i+1} ${mark}</td>
                    <td><span class="pill" style="background:${this.getPillarColor(i)}">P${i+1}</span> ${topics[i].substring(0,15)}...</td>
                    <td style="color:var(--muted-index)">↔</td>
                    <td><span class="pill" style="background:${this.getPillarColor(i+1)}">P${i+2}</span> ${topics[i+1].substring(0,15)}...</td>
                    <td>Crucial diagnostic split.</td>
                </tr>
            `;
        }

        document.getElementById('cross-pillar-body').innerHTML = html;
    },

    renderCaseChains() {
        const topics = this.data.syllabus[this.data.activeSubject] || [];
        let html = '';

        for(let i=0; i<Math.min(topics.length, 3); i++) {
            const color = this.getPillarColor(i);
            html += `
                <div class="chain" style="border-left-color: ${color}">
                    <h4>Clinical Cascade: ${topics[i]}</h4>
                    <div class="steps-wrap">
                        <div class="step"><span class="step-id">P${i+1} · SM-01</span> Initial Presentation</div>
                        <div class="step"><span class="step-id">P${i+1} · SM-02</span> Misinterpretation</div>
                        <div class="step"><span class="step-id">P${i+1} · SM-03</span> Complication</div>
                        <div class="step"><span class="step-id">P${i+1} · SM-04</span> Emergency Rescue</div>
                    </div>
                </div>
            `;
        }
        document.getElementById('case-chains-container').innerHTML = html;
    },

    renderDrugMap() {
        let html = '';
        for(let i=0; i<6; i++) {
            html += `
                <div class="rxc">
                    <h4>Agent / Intervention ${i+1}</h4>
                    <p>Acts on key pathways modulating pathogenesis.</p>
                    <div class="rxc-pills">
                        <span class="pill" style="background:${this.getPillarColor(i)}">Target A</span>
                        <span class="pill" style="background:${this.getPillarColor(i+1)}">Target B</span>
                    </div>
                </div>
            `;
        }
        document.getElementById('rx-grid').innerHTML = html;
    },

    renderSpeedRef() {
        let html = '';
        for(let i=0; i<3; i++) {
            const color = this.getPillarColor(i);
            html += `
                <div class="spc" style="border-top-color: ${color}">
                    <h4>Pillar ${i+1} Quick Ref</h4>
                    <ol>
                        <li>High-yield anchor 1</li>
                        <li>High-yield anchor 2</li>
                        <li>High-yield anchor 3</li>
                    </ol>
                    <div class="rule">Rule: Always assume worst-case mechanism first.</div>
                </div>
            `;
        }
        document.getElementById('speed-grid').innerHTML = html;
    },

    // --- QUIZ ENGINE ---
    startQuiz(topic) {
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('quiz-section').style.display = 'block';
        
        const qList = this.data.activeQuestions.filter(q => q.topic === topic);
        if(qList.length === 0) {
            alert("No questions found for this topic.");
            this.exitQuiz();
            return;
        }
        
        this.data.quizList = qList;
        this.data.currentQIndex = 0;
        this.data.sessionStats = { correct: 0, wrong: 0, total: 0 };
        this.renderQuestion();
        window.scrollTo(0,0);
    },

    exitQuiz() {
        document.getElementById('quiz-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
    },

    renderQuestion() {
        const q = this.data.quizList[this.data.currentQIndex];
        const total = this.data.quizList.length;
        const current = this.data.currentQIndex + 1;

        document.getElementById('quiz-id-badge').innerText = q.id;
        document.getElementById('quiz-progress').innerText = `${current} / ${total}`;
        document.getElementById('q-text').innerHTML = q.question_text.replace(/\n/g, '<br>');

        let imgHtml = '';
        if(q.images && q.images.length > 0) {
            imgHtml = q.images.map(img => 
                `<img src="./data/images/${img}" class="q-image" onclick="App.openImage(this.src)" onerror="this.style.display='none'">`
            ).join('');
        }
        document.getElementById('q-images').innerHTML = imgHtml;

        const optsHtml = q.options.map((opt, i) => {
            return `<div class="option" role="button" tabindex="0" onclick="App.handleAnswer(this, ${i}, '${q.correct_option}')" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); App.handleAnswer(this, ${i}, '${q.correct_option}'); }">
                        ${String.fromCharCode(65 + i)}. ${opt}
                    </div>`;
        }).join('');

        document.getElementById('options-stack').innerHTML = optsHtml;
        document.getElementById('options-stack').classList.remove('answered');

        document.getElementById('expl-text').innerHTML = q.explanation.replace(/\n/g, '<br>');
        document.getElementById('explanation').classList.remove('show');
    },

    handleAnswer(el, index, correctChar) {
        const stack = document.getElementById('options-stack');
        if (stack.classList.contains('answered')) return;
        stack.classList.add('answered');

        const selectedChar = String.fromCharCode(97 + index); 
        const correctIndex = correctChar.toLowerCase().charCodeAt(0) - 97;
        const options = stack.children;

        this.data.sessionStats.total++;
        if (selectedChar === correctChar.toLowerCase()) {
            el.classList.add('selected-correct');
            this.data.sessionStats.correct++;
        } else {
            el.classList.add('selected-wrong');
            this.data.sessionStats.wrong++;
            if(options[correctIndex]) options[correctIndex].classList.add('selected-correct');
        }

        Array.from(options).forEach(opt => opt.classList.add('disabled'));
        document.getElementById('explanation').classList.add('show');
    },

    quiz: {
        next() {
            if(App.data.currentQIndex < App.data.quizList.length - 1) {
                App.data.currentQIndex++;
                App.renderQuestion();
            } else {
                alert(`Quiz Finished! Score: ${App.data.sessionStats.correct}/${App.data.sessionStats.total}`);
                App.exitQuiz();
            }
        },
        prev() {
            if(App.data.currentQIndex > 0) {
                App.data.currentQIndex--;
                App.renderQuestion();
            }
        }
    },

    openImage(src) {
        document.getElementById('lightbox-img').src = src;
        document.getElementById('lightbox').classList.remove('hidden');
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
