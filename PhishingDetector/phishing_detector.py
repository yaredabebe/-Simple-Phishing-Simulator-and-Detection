import re
import json
import argparse
import csv
from urllib.parse import urlparse
from datetime import datetime


class PhishingDetector:
    def __init__(self, rules_file='phishing_rules.json'):
        self.load_rules(rules_file)
        self.results = []

    def load_rules(self, rules_file):
        """Load detection rules from JSON file"""
        try:
            with open(rules_file, 'r') as f:
                self.rules = json.load(f)
        except FileNotFoundError:
            print('no file')

    def analyze_url(self, url):
        """Analyze a URL for phishing indicators"""
        indicators = []
        score = 0

        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()

            # Check for suspicious subdomains
            for pattern in self.rules.get("suspicious_domains", []):
                if pattern in domain:
                    indicators.append(f"Suspicious domain pattern: {pattern}")
                    score += 1

            # Check for brand impersonation
            for brand, variations in self.rules.get("brands", {}).items():
                for variation in variations:
                    if variation in domain:
                        indicators.append(f"Brand impersonation: {brand} as {variation}")
                        score += 2

            # Check for fake TLDs
            for tld in self.rules.get("fake_tlds", []):
                if domain.endswith(tld):
                    indicators.append(f"Suspicious TLD: {tld}")
                    score += 1

            # Check for IP address URLs
            if self.rules.get("ip_address_urls", False) and re.match(r'\d+\.\d+\.\d+\.\d+', domain):
                indicators.append("URL uses IP address instead of domain")
                score += 1

            # Check for URL shortening services
            if any(shortener in domain for shortener in ['bit.ly', 'goo.gl', 'tinyurl']):
                indicators.append("URL shortening service detected")
                score += 0.5  # Less severe

            return {
                "type": "URL",
                "input": url,
                "score": score,
                "indicators": indicators,
                "verdict": "PHISHING" if score >= 1 else "SAFE",
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            return {
                "type": "URL",
                "input": url,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    def analyze_email(self, email_content):
        """Analyze email content for phishing indicators"""
        indicators = []
        score = 0
        content = email_content.lower()

        # Check for urgent language
        for keyword in self.rules.get("urgent_keywords", []):
            if keyword in content:
                indicators.append(f"Urgent language: {keyword}")
                score += 0.5

        # Check for suspicious links
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', content)
        url_results = []
        for url in urls:
            url_result = self.analyze_url(url)
            if url_result['verdict'] == 'PHISHING':
                url_results.append(url_result)
                score += url_result['score']

        # Check for generic greetings
        if any(greeting in content for greeting in ["dear user", "dear customer", "dear member"]):
            indicators.append("Generic greeting")
            score += 0.3

        return {
            "type": "Email",
            "input": email_content[:100] + "...",  # Store first 100 chars
            "score": score,
            "indicators": indicators,
            "url_results": url_results,
            "verdict": "PHISHING" if score >= 1 else "SAFE",
            "timestamp": datetime.now().isoformat()
        }

    def analyze(self, input_data):
        """Determine if input is URL or email and analyze accordingly //python phishing_detector.py -i https://paypa1-login.com"""
        if input_data.startswith(('http://', 'https://', 'www.')):
            result = self.analyze_url(input_data)
        else:
            result = self.analyze_email(input_data)

        self.results.append(result)
        return result

    def export_to_csv(self, filename='phishing_results.csv'):
        """Export analysis results to CSV"""
        if not self.results:
            print("No results to export")
            return

        fieldnames = ['timestamp', 'type', 'input', 'verdict', 'score', 'indicators']

        try:
            with open(filename, 'w', newline='') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()

                for result in self.results:
                    row = {
                        'timestamp': result.get('timestamp'),
                        'type': result.get('type'),
                        'input': result.get('input'),
                        'verdict': result.get('verdict'),
                        'score': result.get('score'),
                        'indicators': "; ".join(result.get('indicators', []))
                    }
                    writer.writerow(row)

            print(f"Results exported to {filename}")
            return True
        except Exception as e:
            print(f"Error exporting to CSV: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description='Phishing Detector Tool')
    parser.add_argument('-i', '--input', help='Input URL or email text to analyze')
    parser.add_argument('-f', '--file', help='File containing multiple inputs (one per line)')
    parser.add_argument('-o', '--output', help='Output CSV file name', default='phishing_results.csv')
    parser.add_argument('-r', '--rules', help='Custom rules JSON file', default='phishing_rules.json')
    args = parser.parse_args()

    detector = PhishingDetector(args.rules)

    if args.input:
        result = detector.analyze(args.input)
        print(f"\nAnalysis Result:")
        print(f"Type: {result['type']}")
        print(f"Input: {result['input'][:200]}...")
        print(f"Verdict: {result['verdict']}")
        print(f"Score: {result['score']}")
        if result['indicators']:
            print("\nIndicators Found:")
            for indicator in result['indicators']:
                print(f"- {indicator}")

    if args.file:
        try:
            with open(args.file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line:  # Skip empty lines
                        detector.analyze(line)

            print(f"\nAnalyzed {len(detector.results)} inputs from file")

        except FileNotFoundError:
            print(f"Error: File {args.file} not found")
            return

    if args.input or args.file:
        detector.export_to_csv(args.output)


if __name__ == '__main__':
    main()