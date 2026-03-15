import json
import os
import sys

def scrape_site(url):
    print(f"{url} 스크래핑 시작...")
    # 실제 스크래핑 로직이 들어갈 자리입니다.
    data = {
        "url": url,
        "content": "이것은 예시 데이터입니다.",
        "status": "success"
    }
    
    output_path = os.path.join("임시", "스크래핑_결과.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"결과 저장 완료: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        scrape_site(sys.argv[1])
    else:
        print("URL이 입력되지 않았습니다.")
