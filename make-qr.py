#!/usr/bin/env python3
"""
申込フォームのQRコードを作るスクリプト。

使い方：
    python3 make-qr.py "https://forms.gle/xxxxxxxx"

Googleフォームの「配布用URL」を渡すと、qr フォルダに3つのファイルができます。
  1. form-qr.svg          チラシ用（Canvaに読み込めます。拡大しても粗くなりません）
  2. form-qr.png          チラシ・印刷物用（2000px四方）
  3. form-qr-small.png    回覧や案内文にちょっと貼るとき用（600px四方）

無料です。インターネット上のQR作成サービスは使わず、この場で作ります。
外部サービスのQRは、あとからリンク切れになることがあるので使いません。
"""
import io
import os
import sys

import segno

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'qr')
DARK = '#22302A'   # 資料の文字色に合わせる（真っ黒より柔らかく見えます）


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    url = sys.argv[1].strip()
    if not url.startswith(('http://', 'https://')):
        print('URLは http:// または https:// で始めてください。')
        sys.exit(1)

    os.makedirs(DIR, exist_ok=True)

    # 誤り訂正レベルM：印刷の汚れや折れに強く、マス目も細かくなりすぎません
    qr = segno.make(url, error='m')
    side = qr.symbol_size(scale=1, border=0)[0]

    svg_path = os.path.join(DIR, 'form-qr.svg')
    png_path = os.path.join(DIR, 'form-qr.png')
    small_path = os.path.join(DIR, 'form-qr-small.png')

    # チラシ用のSVG（Canvaにそのまま読み込めます）
    buf = io.BytesIO()
    qr.save(buf, kind='svg', border=2, dark=DARK, light='#FFFFFF',
            xmldecl=True, svgns=True, omitsize=False, scale=10)
    with open(svg_path, 'wb') as f:
        f.write(buf.getvalue())

    # 印刷用のPNG（2000px四方くらい。チラシで40mmに置いても十分きれいです）
    scale = max(1, round(2000 / (side + 4)))
    qr.save(png_path, scale=scale, border=2, dark=DARK, light='#FFFFFF')

    # 小さく貼るとき用
    qr.save(small_path, scale=max(1, round(600 / (side + 4))), border=2,
            dark=DARK, light='#FFFFFF')

    print('QRコードを作成しました')
    print('  URL        :', url)
    print('  マス目     : %d×%d' % (side, side))
    print('  SVG        :', svg_path)
    print('  PNG        :', png_path)
    print('  PNG（小）  :', small_path)
    print()
    print('チラシ（Canva）には form-qr.svg を読み込んでください。')
    print('印刷するときは、QRの一辺を20mm以上にすると読み取りやすくなります。')


if __name__ == '__main__':
    main()
