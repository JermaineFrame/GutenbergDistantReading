// Distant Reading Visualization Script
// Manages data loading and visualization for architecture texts analysis

class DistantReadingViz {
    constructor() {
        this.allBooks = [];
        this.comparative = null;
        this.topics = null;
        this.currentBook = null;
        this.charts = {};
        this.multiSelectMode = false;
        this.selectedBooks = new Set();

        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderBookButtons();
        } catch (error) {
            console.error('Error initializing:', error);
            alert('Error loading data. Please check the console.');
        }
    }

    async loadData() {
        try {
            // Load all books data
            const booksResponse = await fetch('data/all_books.json');
            this.allBooks = await booksResponse.json();

            // Load comparative data
            const comparativeResponse = await fetch('data/comparative.json');
            this.comparative = await comparativeResponse.json();

            // Load topics data
            const topicsResponse = await fetch('data/topics.json');
            this.topics = await topicsResponse.json();

            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        const compareBtn = document.getElementById('compareBtn');
        compareBtn.addEventListener('click', () => this.showComparative());

        const compareSelectedBtn = document.getElementById('compareSelectedBtn');
        compareSelectedBtn.addEventListener('click', () => this.showSelectedComparative());

        const multiSelectToggle = document.getElementById('multiSelectToggle');
        multiSelectToggle.addEventListener('change', (e) => this.toggleMultiSelectMode(e.target.checked));
    }

    toggleMultiSelectMode(enabled) {
        this.multiSelectMode = enabled;
        const hint = document.getElementById('selectionHint');

        if (enabled) {
            hint.textContent = 'Click books to select/deselect for comparison (select 2 or more)';
            // Clear single book active states
            document.querySelectorAll('.btn-book').forEach(btn => {
                btn.classList.remove('active');
            });
        } else {
            hint.textContent = 'Click a book to view its analysis';
            // Clear selections
            this.selectedBooks.clear();
            document.querySelectorAll('.btn-book').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.updateSelectedCount();
        }
    }

    updateSelectedCount() {
        const count = this.selectedBooks.size;
        document.getElementById('selectedCount').textContent = count;

        const compareSelectedBtn = document.getElementById('compareSelectedBtn');
        if (count >= 2) {
            compareSelectedBtn.classList.remove('hidden');
        } else {
            compareSelectedBtn.classList.add('hidden');
        }
    }

    renderBookButtons() {
        const container = document.getElementById('bookButtons');
        container.innerHTML = '';

        this.allBooks.forEach(book => {
            const button = document.createElement('button');
            button.className = 'btn btn-book';
            button.textContent = this.formatBookTitle(book.title);
            button.dataset.bookTitle = book.title;
            button.addEventListener('click', () => this.handleBookClick(book, button));
            container.appendChild(button);
        });
    }

    handleBookClick(book, button) {
        if (this.multiSelectMode) {
            // Multi-select mode: toggle selection
            if (this.selectedBooks.has(book.title)) {
                this.selectedBooks.delete(book.title);
                button.classList.remove('selected');
            } else {
                this.selectedBooks.add(book.title);
                button.classList.add('selected');
            }
            this.updateSelectedCount();
        } else {
            // Single view mode: show individual book
            this.showBook(book);
        }
    }

    formatBookTitle(title) {
        // Convert camelCase to readable title
        return title.replace(/([A-Z])/g, ' $1').trim();
    }

    showBook(book) {
        this.currentBook = book;

        // Update UI
        document.getElementById('individualView').classList.remove('hidden');
        document.getElementById('comparativeView').classList.add('hidden');

        // Update active button
        document.querySelectorAll('.btn-book').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === this.formatBookTitle(book.title)) {
                btn.classList.add('active');
            }
        });

        document.querySelectorAll('.btn-compare').forEach(btn => {
            btn.classList.remove('active');
        });

        // Update title
        document.getElementById('bookTitle').textContent = this.formatBookTitle(book.title);

        // Render visualizations
        this.renderSentimentChart(book);
        this.renderWordCloud(book);
        this.renderStyleMetrics(book);
        this.renderTopicDistribution(book);
    }

    showComparative() {
        // Update UI
        document.getElementById('individualView').classList.add('hidden');
        document.getElementById('comparativeView').classList.remove('hidden');

        // Update active button
        document.querySelectorAll('.btn-book').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById('compareBtn').classList.add('active');
        document.getElementById('compareSelectedBtn').classList.remove('active');

        // Update title
        document.getElementById('compareTitle').textContent = 'Comparative Analysis: All Books';

        // Render comparative visualizations
        this.renderComparativeSentiment();
        this.renderComparativeReadability();
        this.renderComparativeLexical();
        this.renderComparativeWordCount();
        this.renderTopicsList();
        this.renderComparativeTable();
    }

    showSelectedComparative() {
        if (this.selectedBooks.size < 2) {
            alert('Please select at least 2 books to compare');
            return;
        }

        // Update UI
        document.getElementById('individualView').classList.add('hidden');
        document.getElementById('comparativeView').classList.remove('hidden');

        // Update active button
        document.querySelectorAll('.btn-book').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById('compareBtn').classList.remove('active');
        document.getElementById('compareSelectedBtn').classList.add('active');

        // Update title
        const selectedTitles = Array.from(this.selectedBooks)
            .map(title => this.formatBookTitle(title))
            .join(', ');
        document.getElementById('compareTitle').textContent = `Comparative Analysis: ${selectedTitles}`;

        // Get selected books data
        const selectedBooksData = this.allBooks.filter(book =>
            this.selectedBooks.has(book.title)
        );

        // Render comparative visualizations with selected books
        this.renderComparativeSentiment(selectedBooksData);
        this.renderComparativeReadability(selectedBooksData);
        this.renderComparativeLexical(selectedBooksData);
        this.renderComparativeWordCount(selectedBooksData);
        this.renderTopicsList(selectedBooksData);
        this.renderComparativeTable(selectedBooksData);
    }

    renderSentimentChart(book) {
        const ctx = document.getElementById('sentimentChart');

        // Destroy existing chart
        if (this.charts.sentiment) {
            this.charts.sentiment.destroy();
        }

        const sentiment = book.sentiment;

        this.charts.sentiment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'Neutral'],
                datasets: [{
                    data: [
                        (sentiment.positive * 100).toFixed(1),
                        (sentiment.negative * 100).toFixed(1),
                        (sentiment.neutral * 100).toFixed(1)
                    ],
                    backgroundColor: [
                        '#27ae60',
                        '#e74c3c',
                        '#95a5a6'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });

        // Update summary
        const summary = document.getElementById('sentimentSummary');
        const compound = sentiment.compound;
        let interpretation = '';

        if (compound >= 0.05) {
            interpretation = 'Overall positive sentiment';
        } else if (compound <= -0.05) {
            interpretation = 'Overall negative sentiment';
        } else {
            interpretation = 'Neutral sentiment';
        }

        summary.innerHTML = `
            <strong>Compound Score:</strong> ${compound.toFixed(3)}<br>
            <strong>Interpretation:</strong> ${interpretation}
        `;
    }

    renderWordCloud(book) {
        const canvas = document.getElementById('wordcloud');
        const wordFreq = book.word_frequencies;

        // Convert to array format for wordcloud2
        const wordList = Object.entries(wordFreq).map(([word, freq]) => [word, freq]);

        // Clear canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Generate word cloud
        WordCloud(canvas, {
            list: wordList,
            gridSize: 8,
            weightFactor: 3,
            fontFamily: 'Arial, sans-serif',
            color: function() {
                const colors = ['#3498db', '#2c3e50', '#27ae60', '#e74c3c', '#9b59b6', '#f39c12'];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            rotateRatio: 0.3,
            backgroundColor: '#ecf0f1',
            minSize: 10
        });
    }

    renderStyleMetrics(book) {
        const container = document.getElementById('styleMetrics');
        const metrics = book.style_metrics;

        container.innerHTML = `
            <div class="metric-item">
                <div class="metric-label">Flesch Reading Ease</div>
                <div class="metric-value">${metrics.flesch_reading_ease.toFixed(1)}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Flesch-Kincaid Grade</div>
                <div class="metric-value">${metrics.flesch_kincaid_grade.toFixed(1)}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Avg Sentence Length</div>
                <div class="metric-value">${metrics.avg_sentence_length.toFixed(1)}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Avg Word Length</div>
                <div class="metric-value">${metrics.avg_word_length.toFixed(2)}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Lexical Diversity</div>
                <div class="metric-value">${(metrics.lexical_diversity * 100).toFixed(1)}%</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Total Words</div>
                <div class="metric-value">${metrics.total_words.toLocaleString()}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Unique Words</div>
                <div class="metric-value">${metrics.unique_words.toLocaleString()}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Total Sentences</div>
                <div class="metric-value">${metrics.total_sentences.toLocaleString()}</div>
            </div>
        `;
    }

    renderTopicDistribution(book) {
        const ctx = document.getElementById('topicChart');

        // Destroy existing chart
        if (this.charts.topic) {
            this.charts.topic.destroy();
        }

        // Find this book's topic distribution
        const bookTopic = this.topics.document_topics.find(dt => dt.book === book.title);

        if (!bookTopic) {
            return;
        }

        const labels = bookTopic.topic_distribution.map((_, i) => `Topic ${i + 1}`);

        this.charts.topic = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Topic Probability',
                    data: bookTopic.topic_distribution,
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            callback: function(value) {
                                return (value * 100).toFixed(0) + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Probability: ' + (context.parsed.y * 100).toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    renderComparativeSentiment(booksToCompare = null) {
        const ctx = document.getElementById('compareSentimentChart');

        // Destroy existing chart
        if (this.charts.compareSentiment) {
            this.charts.compareSentiment.destroy();
        }

        // Use provided books or all books
        const books = booksToCompare || this.allBooks;
        const labels = books.map(b => this.formatBookTitle(b.title));
        const sentimentData = books.map(b => b.sentiment.compound);

        this.charts.compareSentiment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Compound Sentiment',
                    data: sentimentData,
                    backgroundColor: sentimentData.map(val =>
                        val >= 0.05 ? '#27ae60' : val <= -0.05 ? '#e74c3c' : '#95a5a6'
                    ),
                    borderWidth: 2,
                    borderColor: '#2c3e50'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: -1,
                        max: 1
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderComparativeReadability(booksToCompare = null) {
        const ctx = document.getElementById('compareReadabilityChart');

        // Destroy existing chart
        if (this.charts.compareReadability) {
            this.charts.compareReadability.destroy();
        }

        // Use provided books or all books
        const books = booksToCompare || this.allBooks;
        const labels = books.map(b => this.formatBookTitle(b.title));
        const fleschEase = books.map(b => b.style_metrics.flesch_reading_ease);
        const fleschGrade = books.map(b => b.style_metrics.flesch_kincaid_grade);

        this.charts.compareReadability = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Flesch Reading Ease',
                        data: fleschEase,
                        backgroundColor: '#3498db',
                        borderWidth: 2,
                        borderColor: '#2980b9'
                    },
                    {
                        label: 'Flesch-Kincaid Grade',
                        data: fleschGrade,
                        backgroundColor: '#e74c3c',
                        borderWidth: 2,
                        borderColor: '#c0392b'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderComparativeLexical(booksToCompare = null) {
        const ctx = document.getElementById('compareLexicalChart');

        // Destroy existing chart
        if (this.charts.compareLexical) {
            this.charts.compareLexical.destroy();
        }

        // Use provided books or all books
        const books = booksToCompare || this.allBooks;
        const labels = books.map(b => this.formatBookTitle(b.title));
        const lexicalData = books.map(b => (b.style_metrics.lexical_diversity * 100).toFixed(1));

        this.charts.compareLexical = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lexical Diversity',
                    data: lexicalData,
                    backgroundColor: '#9b59b6',
                    borderWidth: 2,
                    borderColor: '#8e44ad'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Diversity: ' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    renderComparativeWordCount(booksToCompare = null) {
        const ctx = document.getElementById('compareWordCountChart');

        // Destroy existing chart
        if (this.charts.compareWordCount) {
            this.charts.compareWordCount.destroy();
        }

        // Use provided books or all books
        const books = booksToCompare || this.allBooks;
        const labels = books.map(b => this.formatBookTitle(b.title));
        const wordCountData = books.map(b => b.style_metrics.total_words);

        this.charts.compareWordCount = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Words',
                    data: wordCountData,
                    backgroundColor: '#27ae60',
                    borderWidth: 2,
                    borderColor: '#229954'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Words: ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    renderTopicsList(booksToCompare = null) {
        const container = document.getElementById('topicsList');

        // Use provided books or all books
        const books = booksToCompare || this.allBooks;
        const bookTitles = books.map(b => b.title);

        let html = '';

        this.topics.topics.forEach(topic => {
            // Filter document topics to only show selected books
            const relevantDocs = this.topics.document_topics
                .filter(dt => bookTitles.includes(dt.book) && dt.dominant_topic === topic.topic_id);

            // Only show topic if it's dominant in at least one of the books being compared
            if (booksToCompare === null || relevantDocs.length > 0) {
                html += `
                    <div class="topic-item">
                        <h4>Topic ${topic.topic_id + 1}</h4>
                        <div class="topic-words">
                            ${topic.words.map(word => `<span class="topic-word">${word}</span>`).join('')}
                        </div>
                        <div class="book-topics">
                            <strong>Dominant in:</strong>
                            ${relevantDocs.map(dt => this.formatBookTitle(dt.book)).join(', ') || 'None'}
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = html || '<p>No dominant topics found for selected books.</p>';
    }

    renderComparativeTable(booksToCompare = null) {
        const container = document.getElementById('comparativeTable');

        // Use provided books or all books
        const books = booksToCompare || this.allBooks;

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Book</th>
                        <th>Sentiment</th>
                        <th>Reading Ease</th>
                        <th>Grade Level</th>
                        <th>Lexical Diversity</th>
                        <th>Avg Sentence Length</th>
                        <th>Total Words</th>
                    </tr>
                </thead>
                <tbody>
        `;

        books.forEach(book => {
            html += `
                <tr>
                    <td><strong>${this.formatBookTitle(book.title)}</strong></td>
                    <td>${book.sentiment.compound.toFixed(3)}</td>
                    <td>${book.style_metrics.flesch_reading_ease.toFixed(1)}</td>
                    <td>${book.style_metrics.flesch_kincaid_grade.toFixed(1)}</td>
                    <td>${(book.style_metrics.lexical_diversity * 100).toFixed(1)}%</td>
                    <td>${book.style_metrics.avg_sentence_length.toFixed(1)}</td>
                    <td>${book.style_metrics.total_words.toLocaleString()}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DistantReadingViz();
});
