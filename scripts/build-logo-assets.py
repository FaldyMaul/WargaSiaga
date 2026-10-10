import os
from PIL import Image, ImageDraw
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_LOGO = os.path.join(BASE_DIR, "assets", "icons", "WargaSiaga_logo.png")
ICONS_DIR = os.path.join(BASE_DIR, "assets", "icons")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
PUBLIC_ICONS_DIR = os.path.join(BASE_DIR, "public", "assets", "icons")

os.makedirs(ICONS_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(PUBLIC_ICONS_DIR, exist_ok=True)
TARGET_DIRS = [ICONS_DIR, PUBLIC_DIR, PUBLIC_ICONS_DIR]

img = Image.open(SRC_LOGO).convert("RGBA")

# 1. Bounding boxes
# Mark: 31 to 686 (width 655, height 657)
mark_crop = img.crop((31, 19, 686, 676))
# Text: 701 to 2150, 186 to 642 (width 1449, height 456)
text_crop = img.crop((701, 186, 2150, 642))
# Full horizontal logo: 31 to 2150, 19 to 676 (width 2119, height 657)
full_crop = img.crop((31, 19, 2150, 676))

def make_square_icon(src_img, size, padding_ratio=0.06):
    w, h = src_img.size
    target_content_size = int(size * (1 - 2 * padding_ratio))
    scale = min(target_content_size / w, target_content_size / h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized = src_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    paste_x = (size - new_w) // 2
    paste_y = (size - new_h) // 2
    canvas.paste(resized, (paste_x, paste_y), resized)
    return canvas

def make_white_text(rgba_img, text_start_x=0):
    arr = np.array(rgba_img).copy()
    for y in range(arr.shape[0]):
        for x in range(text_start_x, arr.shape[1]):
            r, g, b, a = arr[y, x]
            if a > 0:
                # White color retaining alpha
                arr[y, x, 0] = 255
                arr[y, x, 1] = 255
                arr[y, x, 2] = 255
    return Image.fromarray(arr)

# 2. Square marks in multiple resolutions
mark_512 = make_square_icon(mark_crop, 512, padding_ratio=0.06)
mark_192 = make_square_icon(mark_crop, 192, padding_ratio=0.06)
mark_180 = make_square_icon(mark_crop, 180, padding_ratio=0.06)
mark_48 = make_square_icon(mark_crop, 48, padding_ratio=0.05)
mark_32 = make_square_icon(mark_crop, 32, padding_ratio=0.04)
mark_16 = make_square_icon(mark_crop, 16, padding_ratio=0.02)

for target_dir in TARGET_DIRS:
    mark_512.save(os.path.join(target_dir, "wargasiaga-mark.png"), "PNG")
    mark_192.save(os.path.join(target_dir, "wargasiaga-mark-192.png"), "PNG")
    mark_32.save(os.path.join(target_dir, "wargasiaga-mark-32.png"), "PNG")
    mark_32.save(os.path.join(target_dir, "favicon.png"), "PNG")
    mark_180.save(os.path.join(target_dir, "apple-touch-icon.png"), "PNG")

mark_512.save(
    os.path.join(PUBLIC_DIR, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)
mark_512.save(
    os.path.join(ICONS_DIR, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)

# 3. Horizontal Full Logo (Dark text & White text)
pad = 12
logo_w, logo_h = full_crop.size
padded_logo = Image.new("RGBA", (logo_w + pad * 2, logo_h + pad * 2), (0, 0, 0, 0))
padded_logo.paste(full_crop, (pad, pad), full_crop)

white_full_crop = make_white_text(full_crop, text_start_x=660)
padded_white_logo = Image.new("RGBA", (logo_w + pad * 2, logo_h + pad * 2), (0, 0, 0, 0))
padded_white_logo.paste(white_full_crop, (pad, pad), white_full_crop)

for target_dir in TARGET_DIRS:
    padded_logo.save(os.path.join(target_dir, "wargasiaga-logo.png"), "PNG")
    padded_white_logo.save(os.path.join(target_dir, "wargasiaga-logo-white.png"), "PNG")

# 4. Stacked Logo (Vertical lockup for About / Splash)
def create_stacked(is_white=False):
    s_size = 600
    canvas = Image.new("RGBA", (s_size, s_size), (0, 0, 0, 0))
    m_size = 320
    m_resized = mark_crop.resize((m_size, int(m_size * mark_crop.height / mark_crop.width)), Image.Resampling.LANCZOS)
    
    t_source = make_white_text(text_crop, text_start_x=0) if is_white else text_crop
    t_width = 440
    t_height = int(t_source.height * (t_width / t_source.width))
    t_resized = t_source.resize((t_width, t_height), Image.Resampling.LANCZOS)
    
    # Vertically align
    total_h = m_resized.height + 24 + t_height
    start_y = (s_size - total_h) // 2
    
    canvas.paste(m_resized, ((s_size - m_resized.width) // 2, start_y), m_resized)
    canvas.paste(t_resized, ((s_size - t_width) // 2, start_y + m_resized.height + 24), t_resized)
    return canvas

stacked_dark = create_stacked(is_white=False)
stacked_white = create_stacked(is_white=True)

for target_dir in TARGET_DIRS:
    stacked_dark.save(os.path.join(target_dir, "wargasiaga-logo-stacked.png"), "PNG")
    stacked_white.save(os.path.join(target_dir, "wargasiaga-logo-stacked-white.png"), "PNG")

# 5. Middle Guardian Figure (Teal person badge)
arr_m = np.array(mark_512).copy()
teal_mask = (arr_m[:, :, 1] > 120) & (arr_m[:, :, 0] < 80) & (arr_m[:, :, 3] > 50)
teal_only = arr_m.copy()
teal_only[~teal_mask] = [0, 0, 0, 0]
teal_img = Image.fromarray(teal_only)
teal_bbox = teal_img.getbbox()
if teal_bbox:
    teal_cropped = teal_img.crop(teal_bbox)
    teal_badge = make_square_icon(teal_cropped, 256, padding_ratio=0.08)
    for target_dir in TARGET_DIRS:
        teal_badge.save(os.path.join(target_dir, "wargasiaga-guardian-teal.png"), "PNG")

# 6. Social Open Graph preview card (1200 x 630)
og_w, og_h = 1200, 630
og_bg = Image.new("RGBA", (og_w, og_h), (15, 23, 42, 255))
draw = ImageDraw.Draw(og_bg)

# Elegant background accents: subtle radial glow
for r in range(350, 0, -4):
    alpha = int(18 * (1 - r / 350))
    draw.ellipse([og_w // 2 - r, 240 - r, og_w // 2 + r, 240 + r], fill=(122, 90, 248, alpha))

target_logo_w = 720
target_logo_h = int(padded_white_logo.height * (target_logo_w / padded_white_logo.width))
og_logo = padded_white_logo.resize((target_logo_w, target_logo_h), Image.Resampling.LANCZOS)
logo_x = (og_w - target_logo_w) // 2
logo_y = (og_h - target_logo_h) // 2 - 20
og_bg.paste(og_logo, (logo_x, logo_y), og_logo)

# Elegant rounded pill banner at bottom
pill_w, pill_h = 560, 48
pill_x = (og_w - pill_w) // 2
pill_y = logo_y + target_logo_h + 36
draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=24, fill=(30, 41, 59, 230), outline=(122, 90, 248, 140), width=2)

# Three dots representing the 3 figures
dot_y = pill_y + 24
draw.ellipse([pill_x + 36, dot_y - 6, pill_x + 48, dot_y + 6], fill=(122, 90, 248, 255))
draw.ellipse([pill_x + pill_w // 2 - 6, dot_y - 6, pill_x + pill_w // 2 + 6, dot_y + 6], fill=(52, 179, 166, 255))
draw.ellipse([pill_x + pill_w - 48, dot_y - 6, pill_x + pill_w - 36, dot_y + 6], fill=(122, 90, 248, 255))

for target_dir in TARGET_DIRS:
    og_bg.convert("RGB").save(os.path.join(target_dir, "wargasiaga-og-preview.png"), "PNG")
og_bg.convert("RGB").save(os.path.join(PUBLIC_DIR, "og-image.png"), "PNG")

print("All logo variants generated successfully!")
