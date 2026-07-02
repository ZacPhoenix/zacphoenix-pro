"""Shared styling framework for the Risk Up Front (RUF) mega workbook.

A small design system on top of openpyxl so every sheet reads as one
coherent, colorful product: consistent palette, typography, banners,
help callouts, tables, and status chips.
"""

from openpyxl.cell.cell import MergedCell
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule, FormulaRule

# ---------------------------------------------------------------- palette --
# Core brand palette (hex, no leading #). Deep indigo primary with warm
# accents; every RUF discipline and artifact gets its own accent color.
INK        = "1B1E3C"   # near-black indigo — primary text on light
PAPER      = "FFFFFF"
CLOUD      = "F4F5FB"   # page background tint
MIST       = "E4E7F5"   # light divider / zebra
SLATE      = "5A5E7A"   # secondary text

PRIMARY    = "3D3A8C"   # deep indigo — headers, banners
PRIMARY_DK = "28265E"
PRIMARY_LT = "ECEBFA"

# Discipline accents (the four RUF disciplines)
ACCOUNT    = "0E7C66"   # accountability — emerald
TRANSPAR   = "0F6BB2"   # transparency — azure
INTEGRITY  = "B25309"   # integrity — amber/bronze
COMMIT     = "8C2D6B"   # commitment — magenta/plum

# Artifact accents
C_STATEMENT = "3D3A8C"  # project statement — indigo
C_TEAM      = "0E7C66"  # team list — emerald
C_RAP       = "C0392B"  # risk action plan — crimson
C_SCHED     = "0F6BB2"  # schedule — azure
C_WAM       = "8C2D6B"  # weekly accountability meeting — plum
C_AI        = "5B21B6"  # AI-agent pages — violet
C_LOG       = "B25309"  # logs — bronze

# Status colors
GOOD    = "1E8E3E"; GOOD_BG    = "E3F4E8"
WARN    = "B8860B"; WARN_BG    = "FCF3D7"
BAD     = "C0392B"; BAD_BG     = "FBE4E0"
NEUTRAL = "5A5E7A"; NEUTRAL_BG = "ECEEF6"
INFOBG  = "E4F0FB"

FONT = "Aptos Narrow"
FONT_BODY = "Aptos Narrow"

THIN = Side(style="thin", color="C9CDE4")
MED  = Side(style="medium", color=PRIMARY)
BORDER_ALL  = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
BORDER_NONE = Border()


def fill(hexcolor):
    return PatternFill("solid", fgColor=hexcolor)


def set_col_widths(ws, widths):
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


def page_setup(ws, accent=PRIMARY, tab=None):
    """Common cosmetics: tab color, no gridlines, background wash column A."""
    ws.sheet_properties.tabColor = tab or accent
    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = 100


def banner(ws, row, ncols, title, subtitle=None, accent=PRIMARY, emoji=""):
    """Big colored title banner across ncols; returns next free row."""
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=ncols)
    c = ws.cell(row=row, column=1, value=f"{emoji}  {title}".strip())
    c.font = Font(name=FONT, size=20, bold=True, color=PAPER)
    c.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    for col in range(1, ncols + 1):
        ws.cell(row=row, column=col).fill = fill(accent)
    ws.row_dimensions[row].height = 40
    row += 1
    if subtitle:
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=ncols)
        s = ws.cell(row=row, column=1, value=subtitle)
        s.font = Font(name=FONT_BODY, size=11, italic=True, color=PAPER)
        s.alignment = Alignment(horizontal="left", vertical="center", indent=1, wrap_text=True)
        for col in range(1, ncols + 1):
            ws.cell(row=row, column=col).fill = fill(accent)
        ws.row_dimensions[row].height = 22
        row += 1
    return row + 1  # one blank spacer row


def section(ws, row, ncols, text, accent=PRIMARY, emoji="", first_col=1):
    """Section sub-header bar. Returns next row."""
    ws.merge_cells(start_row=row, start_column=first_col, end_row=row, end_column=ncols)
    c = ws.cell(row=row, column=first_col, value=f"{emoji}  {text}".strip())
    c.font = Font(name=FONT, size=13, bold=True, color=PAPER)
    c.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    for col in range(first_col, ncols + 1):
        ws.cell(row=row, column=col).fill = fill(accent)
    ws.row_dimensions[row].height = 24
    return row + 1


def helpbox(ws, row, ncols, text, first_col=1, height=None, accent=TRANSPAR):
    """Light-blue help/callout box with wrapped guidance text. Returns next row."""
    ws.merge_cells(start_row=row, start_column=first_col, end_row=row, end_column=ncols)
    c = ws.cell(row=row, column=first_col, value="💡 " + text)
    c.font = Font(name=FONT_BODY, size=10, color=INK, italic=True)
    c.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True, indent=1)
    for col in range(first_col, ncols + 1):
        cc = ws.cell(row=row, column=col)
        cc.fill = fill(INFOBG)
        cc.border = Border(left=Side(style="medium", color=accent) if col == first_col else None)
    if height:
        ws.row_dimensions[row].height = height
    else:
        est = max(18, 14 * (1 + len(text) // 110))
        ws.row_dimensions[row].height = est
    return row + 1


def table_header(ws, row, headers, accent=PRIMARY, start_col=1):
    for j, h in enumerate(headers, start=start_col):
        c = ws.cell(row=row, column=j, value=h)
        c.font = Font(name=FONT, size=10, bold=True, color=PAPER)
        c.fill = fill(accent)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BORDER_ALL
    ws.row_dimensions[row].height = 30
    return row + 1


def body_row(ws, row, values, start_col=1, zebra=False, wrap=True, height=None,
             bold_cols=(), center_cols=(), fills_map=None):
    for j, v in enumerate(values, start=start_col):
        c = ws.cell(row=row, column=j)
        if isinstance(c, MergedCell):
            continue
        c.value = v
        c.font = Font(name=FONT_BODY, size=10, color=INK,
                      bold=(j - start_col) in bold_cols)
        c.alignment = Alignment(
            horizontal="center" if (j - start_col) in center_cols else "left",
            vertical="top", wrap_text=wrap)
        c.border = BORDER_ALL
        if fills_map and (j - start_col) in fills_map:
            c.fill = fill(fills_map[j - start_col])
        elif zebra:
            c.fill = fill(MIST)
        else:
            c.fill = fill(PAPER)
    if height:
        ws.row_dimensions[row].height = height
    return row + 1


def blank_grid(ws, row, n_rows, n_cols, start_col=1, zebra=True, height=None):
    """Empty bordered data-entry rows with zebra striping."""
    for i in range(n_rows):
        for j in range(n_cols):
            c = ws.cell(row=row + i, column=start_col + j)
            if isinstance(c, MergedCell):
                continue
            c.border = BORDER_ALL
            c.font = Font(name=FONT_BODY, size=10, color=INK)
            c.alignment = Alignment(vertical="top", wrap_text=True)
            c.fill = fill(MIST if (zebra and i % 2 == 1) else PAPER)
        if height:
            ws.row_dimensions[row + i].height = height
    return row + n_rows


def label_value(ws, row, label, value, ncols, accent=PRIMARY, label_col=1,
                value_col=2, height=None, help_text=None):
    """A bold label cell + merged value area, optional inline help note."""
    lc = ws.cell(row=row, column=label_col, value=label)
    lc.font = Font(name=FONT, size=10, bold=True, color=PAPER)
    lc.fill = fill(accent)
    lc.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True, indent=1)
    lc.border = BORDER_ALL
    ws.merge_cells(start_row=row, start_column=value_col, end_row=row, end_column=ncols)
    vc = ws.cell(row=row, column=value_col, value=value)
    vc.font = Font(name=FONT_BODY, size=10, color=INK)
    vc.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True, indent=1)
    for col in range(value_col, ncols + 1):
        ws.cell(row=row, column=col).border = BORDER_ALL
        ws.cell(row=row, column=col).fill = fill(PAPER)
    if height:
        ws.row_dimensions[row].height = height
    return row + 1


def note(ws, row, ncols, text, first_col=1, color=SLATE, size=9):
    ws.merge_cells(start_row=row, start_column=first_col, end_row=row, end_column=ncols)
    c = ws.cell(row=row, column=first_col, value=text)
    c.font = Font(name=FONT_BODY, size=size, italic=True, color=color)
    c.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True, indent=1)
    est = max(14, 13 * (1 + len(text) // 120))
    ws.row_dimensions[row].height = est
    return row + 1


def add_dv(ws, options, cell_range, title="Pick one", prompt=None):
    """Dropdown data validation over a range."""
    dv = DataValidation(type="list", formula1='"' + ",".join(options) + '"',
                        allow_blank=True, showDropDown=False)
    dv.promptTitle = title
    if prompt:
        dv.prompt = prompt
        dv.showInputMessage = True
    ws.add_data_validation(dv)
    dv.add(cell_range)
    return dv


def status_conditional(ws, cell_range, mapping):
    """Apply text-equality conditional fills. mapping: {text: (font_hex, bg_hex)}"""
    for text, (fg, bg) in mapping.items():
        ws.conditional_formatting.add(
            cell_range,
            CellIsRule(operator="equal", formula=[f'"{text}"'],
                       fill=fill(bg), font=Font(color=fg, bold=True)))


def formula_conditional(ws, cell_range, formula, fg, bg, bold=True):
    ws.conditional_formatting.add(
        cell_range,
        FormulaRule(formula=[formula], fill=fill(bg), font=Font(color=fg, bold=bold)))


def freeze(ws, cell):
    ws.freeze_panes = cell


def big_text_block(ws, row, ncols, lines, first_col=1, size=10, line_height=14,
                   mono=False, color=INK, bg=None):
    """Write a list of text lines, one row each, merged across ncols.
    Used for long-form AI context / prompt pages."""
    for line in lines:
        ws.merge_cells(start_row=row, start_column=first_col, end_row=row, end_column=ncols)
        c = ws.cell(row=row, column=first_col, value=line)
        c.font = Font(name="Consolas" if mono else FONT_BODY, size=size, color=color)
        c.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True, indent=1)
        if bg:
            for col in range(first_col, ncols + 1):
                ws.cell(row=row, column=col).fill = fill(bg)
        # crude wrap estimate: ~ (13 * size/10) px per wrapped line of ~115 chars
        n_wraps = 1 + len(line) // 105 if line else 1
        ws.row_dimensions[row].height = max(line_height, line_height * n_wraps * 0.95)
        row += 1
    return row
