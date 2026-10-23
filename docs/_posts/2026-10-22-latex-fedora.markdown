---
layout: post
title:  "Building a Resume with Latex on Fedora 44"
date:   2026-10-22 18:02:00 -0700
categories: fedora linux latex xelatex latexmk resume vscode
description: "How to build a XeLaTeX resume template on Fedora 44, with optional auto-build in VS Code."
mermaid: false
asciinema: true
---

As many of you know, LaTeX is one of the most popular tools for producing scientific documents. The ability to share a common vocabulary and formatting convention -- especially within a journal or university -- really brings up the efficiency of researchers and the quality of the final products. Some of our friends even use LaTeX to [take notes](https://castel.dev/post/lecture-notes-1/)!

Since it is time to update my resume again, I decided to use this blog post to remind myself how to use LaTeX, and share the workflow with you all. I found [Yuan's resume](https://github.com/Xyz-yuanhf/yuan-resume) to be a clean single-page template that was helpful in finalizing my own layout.

I'm not an expert on LaTeX, so I'm not going to go into too much detail about it, but you can find resources on LaTeX at [the LaTeX Project](https://www.latex-project.org/) when you need them. This blogpost will focus on finalizing a resume building workflow using either your favorite IDE or the terminal.

---

## 1. Clone the Template

Clone the git repository: `git clone https://github.com/Xyz-yuanhf/yuan-resume && cd yuan-resume`.

```asciinema-latex-git-clone
```

The resume content is in `main.tex`, and the styling (layout, fonts, section formatting) is in `myresume.sty`. The fonts the template uses ship with the repo in the `Fonts/` directory.

---

## 2. Install the Required Packages


Install the TeX distribution and helper tools using `dnf`:

```bash
sudo dnf install latexmk texlive texlive-enumitem texlive-latexindent
```

### What each package does:

* **`latexmk`**: A build tool for LaTeX documents. LaTeX often needs several passes to resolve cross-references, hyperlinks, and the like. `latexmk` works out how many passes are needed and runs the engine until the output stops changing. It also only rebuilds when source files have changed.
* **`texlive`**: The core TeX Live distribution. It provides the TeX engines, including **XeTeX** (`xelatex`), along with the commonly used LaTeX packages the template depends on, such as `fontspec`, `geometry`, `xcolor`, `titlesec`, `tabularx`, and `hyperref`.
* **`texlive-enumitem`**: The `enumitem` package, which isn't included in the base `texlive` install. The template uses it to control spacing and indentation in its bulleted lists (`itemize`), and the build fails with a missing `enumitem.sty` error if you don't have it.
* (Optional) **`texlive-latexindent`**: `latexindent`, a Perl script that formats `.tex` source files with consistent indentation. You only need it if you want auto-formatting in your editor (see step 4).

> **Why XeLaTeX?** The template's style file loads `fontspec` to use custom OpenType/TrueType fonts. `fontspec` doesn't work with `pdflatex`; it requires a Unicode-aware engine like XeLaTeX or LuaLaTeX.

---

## 3. Build the Resume

From the root of the repo, run: `latexmk -synctex=1 -interaction=nonstopmode -file-line-error -xelatex -outdir=./ main`.

```asciinema-latex-build
```

### What each flag does:

* **`-synctex=1`**: Generates a `main.synctex.gz` file that maps PDF locations to source lines. Editors and PDF viewers use it to jump between the source and the PDF in either direction.
* **`-interaction=nonstopmode`**: Keeps going past errors instead of stopping to wait for input at a prompt. You need this for unattended or editor-triggered builds.
* **`-file-line-error`**: Prints errors as `file:line:error`, which is easier to read and lets editors link each error to the right line.
* **`-xelatex`**: Tells `latexmk` to compile with XeLaTeX instead of the default `pdflatex`.
* **`-outdir=./`**: Writes the PDF and all auxiliary files (`.aux`, `.log`, `.fls`, `.fdb_latexmk`, etc.) to the current directory.
* **`main`**: The document to build. `latexmk` resolves this to `main.tex`.

If everything worked, you'll have a `main.pdf` in the repo directory. To clean up the auxiliary files later, run `latexmk -c`.

---

## 4. (Optional) Set Up Auto-Build in VS Code

If you use VS Code, or a VS Code-based editor that supports the LaTeX Workshop extension (VSCodium, Antigravity, etc.), you can have the PDF rebuild automatically on every save and preview it side by side with the source.

### 4.a Install LaTeX Workshop

Open the Extensions view and install [**LaTeX Workshop**](https://open-vsx.org/extension/James-Yu/latex-workshop) (`James-Yu.latex-workshop`)

The remaining steps edit your `settings.json`. You can open it from the Command Palette (`Ctrl + Shift + P`) with **Preferences: Open User Settings (JSON)**. If you'd rather keep the settings per project, put them in `.vscode/settings.json` in the repo instead.

### 4.b Use `latexindent` as the Formatter

```json
{
    "latex-workshop.formatting.latex": "latexindent"
}
```

Now **Format Document** (`Ctrl + Shift + I`) or format-on-save will run `latexindent` on your `.tex` files.

### 4.c Add a `xelatexmk` Tool

A *tool* in LaTeX Workshop is a single command the extension can run. This one is the same `latexmk` command from step 3, with LaTeX Workshop placeholders filled in:

```json
{
    "latex-workshop.latex.tools": [
        {
            "name": "xelatexmk",
            "command": "latexmk",
            "args": [
                "-synctex=1",
                "-interaction=nonstopmode",
                "-file-line-error",
                "-xelatex",
                "-outdir=%OUTDIR%",
                "%DOC%"
            ],
            "env": {}
        }
    ]
}
```

* **`%DOC%`**: The root `.tex` file being built, without its extension.
* **`%OUTDIR%`**: The output directory, set by `latex-workshop.latex.outDir` (defaults to the document's own directory).

### 4.d Add a `xelatexmk` Recipe

A *recipe* is a sequence of tools that LaTeX Workshop runs to build a document. This recipe just runs the tool defined above:

```json
{
    "latex-workshop.latex.recipes": [
        {
            "name": "xelatexmk",
            "tools": [
                "xelatexmk"
            ]
        }
    ]
}
```

By default, LaTeX Workshop uses the **first** recipe in the list, so put `xelatexmk` at the top if you already have other recipes defined. You can also pick a recipe manually from the **TeX** sidebar under **Build LaTeX project**.

### 4.e Putting It All Together

All three snippets go in the same top-level object in `settings.json`, so your combined config should look like this:

```json
{
    "latex-workshop.formatting.latex": "latexindent",
    "latex-workshop.latex.tools": [
        {
            "name": "xelatexmk",
            "command": "latexmk",
            "args": [
                "-synctex=1",
                "-interaction=nonstopmode",
                "-file-line-error",
                "-xelatex",
                "-outdir=%OUTDIR%",
                "%DOC%"
            ],
            "env": {}
        }
    ],
    "latex-workshop.latex.recipes": [
        {
            "name": "xelatexmk",
            "tools": [
                "xelatexmk"
            ]
        }
    ]
}
```

### 4.f Verify the Build and Preview

Confirm that whenever you save `main.tex` in vscode (even if there are no changes), `main.pdf` is automatically updated.

---

## 5. (Optional) Add Additional Fonts

The template's body text is set in **Sabon**, a classic serif typeface. Serif fonts are traditional for print, and the small strokes at the ends of each letter help guide the eye along a line on paper. At present, most resumes are now read on screens. On screens, especially at small sizes or lower resolutions, the fine strokes in serif fonts may not render clearly and can look fuzzy or cluttered. Sans serif letterforms are simpler and render more crisply, which tends to make them more comfortable to read on a computer. Line and Dot Studio's [serif vs. sans serif guide](https://lineanddotstudio.com/blog/serif-vs-sans-serif-guide/) covers the trade-offs in more detail.

Since the template uses `fontspec`, you can use any OpenType (`.otf`) or TrueType (`.ttf`) font. There are two ways to add one.

### 5.a Bundle the Font with the Repo

This is the approach the template already takes, and it keeps the build reproducible on any machine that clones the repo. Download a font family, for example [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3), and copy the font files into a new folder under `Fonts/`:

```bash
mkdir -p Fonts/SourceSans3
cp ~/Downloads/SourceSans3-{Regular,Bold,Italic,BoldItalic}.ttf Fonts/SourceSans3/
```

Then, in `myresume.sty`, point `fontspec` at the folder. To make it the main body font, replace the existing `\setmainfont{SabonLTStd}[...]` block:

```latex
\setmainfont{SourceSans3}[
    Path=./Fonts/SourceSans3/,
    Extension = .ttf,
    UprightFont=*-Regular,
    BoldFont=*-Bold,
    ItalicFont=*-Italic,
    BoldItalicFont=*-BoldItalic
    ]
```

The `*` in each option is replaced with the font name in braces, so `UprightFont=*-Regular` loads `Fonts/SourceSans3/SourceSans3-Regular.ttf`. Adjust these to match your font's file names.

If you only want the font for specific elements, such as your name or section headings, define it as a named family with `\newfontfamily` instead, the same way the template defines `\Calluna` and `\CronosLt`:

```latex
\newfontfamily\SourceSans{SourceSans3}[
    Path=./Fonts/SourceSans3/,
    Extension = .ttf,
    UprightFont=*-Regular,
    BoldFont=*-Bold
    ]
```

Then switch to it inline in `main.tex` with `{\SourceSans Your Name}`.

### 5.b Use a System-Installed Font

XeLaTeX can also find any font installed on your system through fontconfig, so you don't need `Path` or file names, just the font's family name. Fedora ships plenty of fonts in its repos, and some (like **Noto Sans**) come preinstalled. To see the family names available:

```bash
fc-list : family | sort -u
```

To install another font from the Fedora repos, search for it and install it with `dnf`:

```bash
dnf search fonts | grep -i sans
sudo dnf install google-noto-sans-fonts
```

Then reference it by name in `myresume.sty`:

```latex
\setmainfont{Noto Sans}
```

If you install fonts by hand into `~/.local/share/fonts/`, run `fc-cache -f` so fontconfig (and XeLaTeX) can find them.

> **Tip:** System fonts are convenient, but the resume will only build on machines that have the same fonts installed. If you plan to build on another computer, bundle the fonts with the repo instead (5.a). Also check the font's license before committing font files to a public repository.

Rebuild with `latexmk` (or just save in VS Code) to see the new font.
