#!/usr/bin/env python3
"""
Distant Reading Analysis Script for Architecture Texts
Performs sentiment analysis, topic modeling, and style metrics on Project Gutenberg texts.
"""

import os
import json
import re
from collections import Counter
from pathlib import Path

import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import textstat
import numpy as np


class DistantReadingAnalyzer:
    """Analyzes texts using various distant reading methods."""

    def __init__(self, texts_dir='texts', output_dir='data'):
        self.texts_dir = Path(texts_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        # Initialize NLTK data
        self._download_nltk_data()

        # Initialize sentiment analyzer
        self.sentiment_analyzer = SentimentIntensityAnalyzer()

        # Store processed texts
        self.texts = {}
        self.analysis_results = {}

    def _download_nltk_data(self):
        """Download required NLTK data."""
        required_data = ['punkt', 'stopwords', 'averaged_perceptron_tagger']
        for data in required_data:
            try:
                nltk.data.find(f'tokenizers/{data}')
            except LookupError:
                nltk.download(data, quiet=True)

    def load_texts(self):
        """Load all text files from the texts directory."""
        print("Loading texts...")
        for file_path in self.texts_dir.glob('*.txt'):
            book_name = file_path.stem
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            self.texts[book_name] = content
            print(f"  Loaded: {book_name}")

    def clean_text(self, text):
        """Clean and preprocess text."""
        # Remove Project Gutenberg headers/footers
        text = re.sub(r'\*\*\*.*?\*\*\*', '', text, flags=re.DOTALL)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def analyze_sentiment(self, text):
        """Analyze sentiment using VADER."""
        sentences = sent_tokenize(text)
        sentiments = []

        for sentence in sentences:
            scores = self.sentiment_analyzer.polarity_scores(sentence)
            sentiments.append(scores)

        # Aggregate sentiment scores
        if sentiments:
            avg_sentiment = {
                'positive': np.mean([s['pos'] for s in sentiments]),
                'negative': np.mean([s['neg'] for s in sentiments]),
                'neutral': np.mean([s['neu'] for s in sentiments]),
                'compound': np.mean([s['compound'] for s in sentiments])
            }
        else:
            avg_sentiment = {'positive': 0, 'negative': 0, 'neutral': 0, 'compound': 0}

        return avg_sentiment

    def calculate_style_metrics(self, text):
        """Calculate various style and readability metrics."""
        sentences = sent_tokenize(text)
        words = word_tokenize(text.lower())

        # Filter to only alphabetic words
        words_alpha = [w for w in words if w.isalpha()]

        metrics = {
            'flesch_reading_ease': textstat.flesch_reading_ease(text),
            'flesch_kincaid_grade': textstat.flesch_kincaid_grade(text),
            'avg_sentence_length': len(words_alpha) / len(sentences) if sentences else 0,
            'avg_word_length': np.mean([len(w) for w in words_alpha]) if words_alpha else 0,
            'lexical_diversity': len(set(words_alpha)) / len(words_alpha) if words_alpha else 0,
            'total_words': len(words_alpha),
            'total_sentences': len(sentences),
            'unique_words': len(set(words_alpha))
        }

        return metrics

    def get_word_frequencies(self, text, top_n=50):
        """Get word frequency counts for word cloud generation."""
        words = word_tokenize(text.lower())
        words_alpha = [w for w in words if w.isalpha() and len(w) > 3]

        # Remove stopwords
        stop_words = set(stopwords.words('english'))
        words_filtered = [w for w in words_alpha if w not in stop_words]

        # Count frequencies
        word_freq = Counter(words_filtered)
        top_words = dict(word_freq.most_common(top_n))

        return top_words

    def perform_topic_modeling(self, n_topics=5, n_top_words=10):
        """Perform LDA topic modeling on all texts."""
        print("Performing topic modeling...")

        # Prepare documents
        documents = [self.clean_text(text) for text in self.texts.values()]
        book_names = list(self.texts.keys())

        # Create document-term matrix
        vectorizer = CountVectorizer(
            max_df=0.95,
            min_df=2,
            stop_words='english',
            max_features=1000
        )

        doc_term_matrix = vectorizer.fit_transform(documents)

        # Perform LDA
        lda = LatentDirichletAllocation(
            n_components=n_topics,
            random_state=42,
            max_iter=20
        )

        lda.fit(doc_term_matrix)

        # Extract topics
        feature_names = vectorizer.get_feature_names_out()
        topics = []

        for topic_idx, topic in enumerate(lda.components_):
            top_words_idx = topic.argsort()[-n_top_words:][::-1]
            top_words = [feature_names[i] for i in top_words_idx]
            topics.append({
                'topic_id': topic_idx,
                'words': top_words,
                'weights': [float(topic[i]) for i in top_words_idx]
            })

        # Get document-topic distribution
        doc_topic_dist = lda.transform(doc_term_matrix)

        # Map documents to dominant topics
        doc_topics = []
        for i, book_name in enumerate(book_names):
            topic_dist = doc_topic_dist[i]
            dominant_topic = int(np.argmax(topic_dist))
            doc_topics.append({
                'book': book_name,
                'dominant_topic': dominant_topic,
                'topic_distribution': [float(x) for x in topic_dist]
            })

        return {
            'topics': topics,
            'document_topics': doc_topics,
            'n_topics': n_topics
        }

    def analyze_all_texts(self):
        """Perform complete analysis on all texts."""
        print("\nAnalyzing texts...")

        for book_name, text in self.texts.items():
            print(f"\n  Analyzing: {book_name}")
            cleaned_text = self.clean_text(text)

            # Perform analyses
            sentiment = self.analyze_sentiment(cleaned_text)
            style_metrics = self.calculate_style_metrics(cleaned_text)
            word_freq = self.get_word_frequencies(cleaned_text)

            self.analysis_results[book_name] = {
                'title': book_name,
                'sentiment': sentiment,
                'style_metrics': style_metrics,
                'word_frequencies': word_freq
            }

        # Perform topic modeling on entire corpus
        topic_results = self.perform_topic_modeling()

        return topic_results

    def save_results(self, topic_results):
        """Save analysis results to JSON files."""
        print("\nSaving results...")

        # Save individual book analyses
        all_books = []
        for book_name, results in self.analysis_results.items():
            all_books.append(results)

            # Save individual book file
            output_file = self.output_dir / f'{book_name}.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)
            print(f"  Saved: {output_file}")

        # Save combined results
        combined_file = self.output_dir / 'all_books.json'
        with open(combined_file, 'w', encoding='utf-8') as f:
            json.dump(all_books, f, indent=2)
        print(f"  Saved: {combined_file}")

        # Save topic modeling results
        topic_file = self.output_dir / 'topics.json'
        with open(topic_file, 'w', encoding='utf-8') as f:
            json.dump(topic_results, f, indent=2)
        print(f"  Saved: {topic_file}")

        # Create comparative metrics
        comparative = self._create_comparative_metrics()
        comparative_file = self.output_dir / 'comparative.json'
        with open(comparative_file, 'w', encoding='utf-8') as f:
            json.dump(comparative, f, indent=2)
        print(f"  Saved: {comparative_file}")

    def _create_comparative_metrics(self):
        """Create comparative metrics across all books."""
        comparative = {
            'books': [],
            'metrics': {}
        }

        metric_keys = [
            'flesch_reading_ease',
            'flesch_kincaid_grade',
            'avg_sentence_length',
            'avg_word_length',
            'lexical_diversity',
            'total_words'
        ]

        for metric in metric_keys:
            comparative['metrics'][metric] = []

        comparative['metrics']['sentiment_compound'] = []

        for book_name, results in self.analysis_results.items():
            comparative['books'].append(book_name)

            for metric in metric_keys:
                value = results['style_metrics'][metric]
                comparative['metrics'][metric].append(round(value, 2))

            comparative['metrics']['sentiment_compound'].append(
                round(results['sentiment']['compound'], 3)
            )

        return comparative

    def run(self):
        """Run the complete analysis pipeline."""
        print("=" * 60)
        print("Distant Reading Analysis - Architecture Texts")
        print("=" * 60)

        self.load_texts()
        topic_results = self.analyze_all_texts()
        self.save_results(topic_results)

        print("\n" + "=" * 60)
        print("Analysis complete! Results saved to 'data/' directory")
        print("=" * 60)


if __name__ == '__main__':
    analyzer = DistantReadingAnalyzer()
    analyzer.run()
