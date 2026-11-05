"""Generate icons/16.png, 48.png, 128.png from a 16x16 pixel sprite (stdlib only)."""
import pathlib
import struct
import zlib

SPRITE = [
    "......OO........",
    ".....OYYO.......",
    ".....OYYO.......",
    ".....OYYO.......",
    ".....OYYO.......",
    ".....OYYOOOOO...",
    ".OOOOOYYYYYYYO..",
    ".OBBOYYYYYYYYYO.",
    ".OBBOYYYYYYYYYYO",
    ".OBBOYYYYYYYYYOO",
    ".OBBOYYSSSSSYYYO",
    ".OBBOYYYYYYYYYOO",
    ".OBBOYYSSSSSYYYO",
    ".OBBOOYYYYYYYOO.",
    ".OOOO.OOOOOOO...",
    "................",
]
COLORS = {
    ".": (0, 0, 0, 0),
    "O": (32, 24, 48, 255),
    "Y": (255, 204, 77, 255),
    "S": (224, 160, 48, 255),
    "B": (56, 120, 224, 255),
}
assert len(SPRITE) == 16 and all(len(r) == 16 for r in SPRITE)


def png(rows, size):
    raw = b"".join(b"\x00" + b"".join(bytes(px) for px in row) for row in rows)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


out = pathlib.Path(__file__).resolve().parent.parent / "icons"
out.mkdir(exist_ok=True)
for size in (16, 48, 128):
    k = size // 16
    rows = []
    for r in SPRITE:
        row = [COLORS[c] for c in r for _ in range(k)]
        rows.extend([row] * k)
    (out / f"{size}.png").write_bytes(png(rows, size))
    print("wrote", size)
