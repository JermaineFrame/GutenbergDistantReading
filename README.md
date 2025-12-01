# Distant Reading: Architecture Texts Analysis

An interactive distant reading project analyzing five architecture texts from Project Gutenberg using Python NLP techniques and web-based visualizations.

## 📚 Project Overview

This project demonstrates distant reading techniques by analyzing five books on architecture. It uses Python for text analysis (sentiment analysis, topic modeling, and style metrics) and provides an interactive web interface for exploring the results.

## 🏗️ Architecture Texts Analyzed

1. **Haciendas**
2. **Historic Paris**
3. **Japanese Homes**
4. **Nineteenth Twentieth Century**
5. **Palace And Park**

## ✨ Features

### Python Analysis (`analyze.py`)
- **Text Processing**: Cleans and preprocesses texts from Project Gutenberg
- **Sentiment Analysis**: Uses VADER to analyze emotional tone throughout texts
- **Topic Modeling**: Employs LDA (Latent Dirichlet Allocation) to discover key themes
- **Style Metrics**: Calculates:
  - Flesch Reading Ease and Flesch-Kincaid Grade Level
  - Lexical diversity and vocabulary richness
  - Average sentence and word length
  - Total word counts and unique words

### Interactive Web Interface
- **Individual Book Analysis**: View detailed metrics for each text
- **Word Clouds**: Visual representation of most frequent terms
- **Sentiment Charts**: Doughnut charts showing positive/negative/neutral sentiment
- **Topic Distribution**: Bar charts displaying topic probabilities
- **Comparative Analysis**: Side-by-side comparison of all five books
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites
- Python 3.7+
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JermaineFrame/GutenbergDistantReading.git
cd GutenbergDistantReading
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Running the Analysis

Execute the Python script to analyze the texts:

```bash
python3 analyze.py
```

This will process all texts in the `texts/` folder and generate JSON files in the `data/` directory.

### Viewing the Web Interface

Open `index.html` in your web browser:

```bash
# Using Python's built-in server
python3 -m http.server 8000

# Then visit http://localhost:8000 in your browser
```

Or simply open `index.html` directly in your browser.

## 📊 Data Output

The analysis generates several JSON files in the `data/` directory:

- `all_books.json` - Combined analysis for all books
- `comparative.json` - Comparative metrics across all texts
- `topics.json` - Topic modeling results
- Individual book files (e.g., `Haciendas.json`)

## 🛠️ Technology Stack

### Python Libraries
- **NLTK**: Natural language processing and tokenization
- **vaderSentiment**: Sentiment analysis
- **scikit-learn**: Machine learning for topic modeling
- **gensim**: Topic modeling implementation
- **textstat**: Readability metrics calculation

### Web Technologies
- **HTML5/CSS3**: Structure and styling
- **JavaScript (ES6)**: Interactive functionality
- **Chart.js**: Data visualization
- **WordCloud2.js**: Word cloud generation

## 📖 Usage

### Analyzing Individual Books

1. Click on any book button to view its analysis
2. Explore sentiment scores, word clouds, style metrics, and topic distribution
3. Hover over charts for detailed information

### Comparing All Books

1. Click the "Compare All Books" button
2. View side-by-side comparisons of sentiment, readability, and style metrics
3. Explore topic modeling results showing themes across the corpus
4. Check the detailed metrics table for numerical comparisons

## 🎨 Visualizations

- **Word Clouds**: Most frequent words (excluding stopwords)
- **Sentiment Doughnut Charts**: Proportion of positive, negative, and neutral sentiment
- **Topic Distribution Bars**: Probability distribution across discovered topics
- **Comparative Bar Charts**: Side-by-side metrics for all books
- **Metrics Table**: Detailed numerical comparison

## 📝 Understanding the Metrics

### Sentiment Scores
- **Compound Score**: Overall sentiment (-1 to +1, where >0.05 is positive, <-0.05 is negative)
- **Positive/Negative/Neutral**: Proportion of each sentiment type

### Readability Metrics
- **Flesch Reading Ease**: Higher scores = easier to read (0-100 scale)
- **Flesch-Kincaid Grade**: U.S. grade level needed to understand the text

### Style Metrics
- **Lexical Diversity**: Ratio of unique words to total words (higher = more varied vocabulary)
- **Average Sentence Length**: Words per sentence
- **Average Word Length**: Characters per word

## 🌐 GitHub Pages Deployment

This site is designed for easy deployment to GitHub Pages:

1. Ensure all files are committed to your repository
2. Go to repository Settings > Pages
3. Select the branch (e.g., `main` or `gh-pages`)
4. Set folder to `/` (root)
5. Save and wait for deployment

The site will be available at: `https://yourusername.github.io/GutenbergDistantReading/`

## 📚 References

- [Project Gutenberg](https://www.gutenberg.org/) - Source of texts
- [VADER Sentiment Analysis](https://github.com/cjhutto/vaderSentiment)
- [Chart.js Documentation](https://www.chartjs.org/)
- [WordCloud2.js](https://github.com/timdream/wordcloud2.js)

## 📄 License

This project uses texts from Project Gutenberg, which are in the public domain in the United States.

## 🤝 Contributing

Feel free to fork this project and adapt it for your own distant reading analyses!

## 👤 Author

Created as a demonstration of distant reading techniques for literary and textual analysis.