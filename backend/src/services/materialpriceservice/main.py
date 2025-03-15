
# CURRENTLY NOT WORKING DUE TO DUCKDUCKGO CHANGES , ALSO IN DEVELOPMENT

# CURRENTLY NOT WORKING DUE TO DUCKDUCKGO CHANGES , ALSO IN DEVELOPMENT

# CURRENTLY NOT WORKING DUE TO DUCKDUCKGO CHANGES , ALSO IN DEVELOPMENT

import re
import logging
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
import spacy
from urllib.parse import urlparse, parse_qs, unquote
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
class CarPartsPriceScraper:
    def __init__(self):
        self.config = {
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'timeout': 15,
            'max_retries': 3,
            'request_delay': 1.5,
            'max_results': 5,
            'min_price': 5.0,
            'max_price': 2000.0
        }
        
        self.session = requests.Session()
        retries = Retry(
            total=self.config['max_retries'],
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504]
        )
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
        self.session.headers.update({
            'User-Agent': self.config['user_agent'],
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://google.com/',
            'DNT': '1'
        })

        try:
            self.nlp = spacy.load("en_core_web_sm")
        except IOError:
            logging.error("Spacy model 'en_core_web_sm' not found. Install with: python -m spacy download en_core_web_sm")
            raise

        self.price_pattern = re.compile(
            r'(?:\$|€|£|USD|EUR|GBP)\s?\d{1,3}(?:[,.]\d{3})*(?:[,.]\d{2})?|'
            r'\d{1,3}(?:[,.]\d{3})*(?:[,.]\d{2})?\s?(?:USD|EUR|GBP|\$|€|£)'
        )

    def is_valid_price(self, price: float) -> bool: 
        return self.config['min_price'] <= price <= self.config['max_price']

    def normalize_price(self, price_str: str) -> float: 
        try:
            clean = re.sub(r'[^\d.,]', '', price_str)
            if ',' in clean and '.' in clean:
                clean = clean.replace('.', '').replace(',', '.')
            elif ',' in clean:
                clean = clean.replace(',', '.')
            return round(float(clean), 2)
        except (ValueError, TypeError):
            return None

    def extract_prices(self, text: str) -> List[dict]: 
        prices = []
        doc = self.nlp(text)
         
        for match in self.price_pattern.finditer(text):
            price = self.normalize_price(match.group())
            if price and self.is_valid_price(price):
                prices.append({'value': price, 'original': match.group(), 'source': 'regex'})
         
        for ent in doc.ents:
            if ent.label_ == "MONEY":
                prev_words = " ".join([t.text for t in ent.sent[:ent.start]][-3:])
                next_words = " ".join([t.text for t in ent.sent[ent.end:]][:3])
                
                price_keywords = {'price', 'cost', 'usd', 'eur', '£', '$', '€', 'buy', 'order'}
                if any(kw in prev_words.lower() or kw in next_words.lower() for kw in price_keywords):
                    price = self.normalize_price(ent.text)
                    if price and self.is_valid_price(price):
                        prices.append({'value': price, 'original': ent.text, 'source': 'nlp'})
         
        seen = set()
        return [p for p in prices if not (p['value'], p['original']) in seen and seen.add((p['value'], p['original'])) is None]

    def get_clean_text(self, soup: BeautifulSoup) -> str: 
        for tag in ['script', 'style', 'nav', 'footer', 'header', 'form', 'iframe']:
            for element in soup(tag):
                element.decompose()
        return ' '.join(soup.stripped_strings)

    def search_duckduckgo(self, query: str) -> List[str]: 
        query += " site:amazon.com OR site:ebay.com OR site:autoparts.com OR site:rockauto.com"
        params = {
            'q': query,
            'kl': 'en-us',
            'ia': 'web',
            'iax': 'web'
        }
        
        try:
            response = self.session.get(
                'https://html.duckduckgo.com/html/',
                params=params,
                timeout=self.config['timeout']
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            links = []
             
            for result in soup.select('div.result__body'):
                link = result.find('a', class_='result__url')
                if link and (href := link.get('href')): 
                    if href.startswith('/l/?uddg='):
                        query_params = parse_qs(urlparse(href).query)
                        if 'uddg' in query_params:
                            decoded_url = unquote(query_params['uddg'][0])
                            parsed = urlparse(decoded_url)
                            if parsed.netloc and parsed.scheme:
                                links.append(decoded_url)
                                if len(links) >= self.config['max_results']:
                                    break
            
            return links
            
        except Exception as e:
            logging.error(f"Search failed: {str(e)}")
            return []


    def scrape_page(self, url: str) -> List[dict]:
      
        try:
            response = self.session.get(url, timeout=self.config['timeout'])
            soup = BeautifulSoup(response.content, 'html.parser')
             
            structured_price = None
            price_element = soup.find(attrs={'itemprop': 'price'}) or \
                           soup.find(class_=re.compile(r'price|cost|amount', re.I))
            
            if price_element:
                structured_price = price_element.get('content') or price_element.get_text()
                price = self.normalize_price(structured_price)
                if price and self.is_valid_price(price):
                    return [{'value': price, 'original': structured_price, 'source': 'structured'}]
             
            text = self.get_clean_text(soup)
            return self.extract_prices(text)
        except Exception as e:
            logging.error(f"Scraping failed for {url}: {str(e)}")
            return []

    def get_prices(self, query: str) -> List[dict]: 
        results = []
        urls = self.search_duckduckgo(query)
        logging.info(f"Found {len(urls)} relevant URLs")
        
        for url in urls:
            logging.info(f"Processing: {url}")
            prices = self.scrape_page(url)
            if prices:
                results.extend(prices)
         
        valid_results = [p for p in results if p['value'] is not None]
        return sorted(valid_results, key=lambda x: x['value'])

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    scraper = CarPartsPriceScraper()
    query = "window audi a4 b6"
    results = scraper.get_prices(query)
    
    print(f"\nFound {len(results)} valid prices for '{query}':")
    for idx, price in enumerate(results[:50], 1):
        print(f"{idx}. ${price['value']:.2f} (source: {price['source']}, original: {price['original']})")