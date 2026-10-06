document.addEventListener('DOMContentLoaded', () => {
    const ipInput = document.getElementById('ip-input');
    const leadingZerosToggle = document.getElementById('leading-zeros');
    const showLinksToggle = document.getElementById('show-links');
    const countBadge = document.getElementById('count-badge');
    const resultsOutput = document.getElementById('results-output');
    const errorMessage = document.getElementById('error-message');
    const copyBtn = document.getElementById('copy-btn');

    // Wire up events
    [ipInput, leadingZerosToggle, showLinksToggle].forEach(el => {
        el.addEventListener('input', generateAndRender);
        el.addEventListener('change', generateAndRender);
    });

    copyBtn.addEventListener('click', () => {
        const text = Array.from(resultsOutput.querySelectorAll('.output-line'))
            .map(line => line.textContent)
            .join('\n');
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Initial render
    generateAndRender();

    function parseIP(ipStr) {
        const parts = ipStr.trim().split('.');
        if (parts.length > 4 || parts.length === 0 || ipStr.trim() === '') return null;

        let parsedParts = parts.map(part => {
            if (/^0x[0-9a-f]+$/i.test(part)) return parseInt(part, 16);
            if (/^0[0-7]+$/.test(part)) return parseInt(part, 8);
            if (/^[0-9]+$/.test(part)) return parseInt(part, 10);
            return NaN;
        });

        if (parsedParts.some(isNaN)) return null;

        let val = 0;
        if (parsedParts.length === 4) {
            if (parsedParts.some(p => p > 255)) return null;
            val = (parsedParts[0] * 16777216) + (parsedParts[1] * 65536) + (parsedParts[2] * 256) + parsedParts[3];
        } else if (parsedParts.length === 3) {
            if (parsedParts[0] > 255 || parsedParts[1] > 255 || parsedParts[2] > 65535) return null;
            val = (parsedParts[0] * 16777216) + (parsedParts[1] * 65536) + parsedParts[2];
        } else if (parsedParts.length === 2) {
            if (parsedParts[0] > 255 || parsedParts[1] > 16777215) return null;
            val = (parsedParts[0] * 16777216) + parsedParts[1];
        } else if (parsedParts.length === 1) {
            if (parsedParts[0] > 4294967295) return null;
            val = parsedParts[0];
        }

        const p1 = Math.floor(val / 16777216) & 255;
        const p2 = Math.floor(val / 65536) & 255;
        const p3 = Math.floor(val / 256) & 255;
        const p4 = val & 255;
        return [p1, p2, p3, p4];
    }

    function formatVal(n, format, addzero = false) {
        if (format === 'dec') return `${n}`;
        if (format === 'hex') {
            let hex = n.toString(16);
            return addzero ? `0x0${hex}` : `0x${hex}`;
        }
        if (format === 'oct') {
            let oct = n.toString(8);
            return addzero ? `00${oct}` : `0${oct}`;
        }
    }

    function generateNotations(ipParts, includeLeadingZeros) {
        let results = [];
        let leftout = {};
        const formats = ['dec', 'hex', 'oct'];

        function recurse(pos = 0, f = null, sofar = '', addanotherzero = false) {
            if (f !== null) {
                if (ipParts[2] === 0 && (pos === 2 || (pos === 1 && ipParts[1] === 0)) && !leftout[pos]) {
                    leftout[pos] = true;
                    recurse(3, null, sofar);
                }

                if (f === 'oct' && !includeLeadingZeros && ipParts[pos] < 8) {
                    return;
                }

                if (includeLeadingZeros && f !== 'dec') {
                    if (!addanotherzero) {
                        recurse(pos, f, sofar, true);
                    }
                }

                sofar += formatVal(ipParts[pos], f, addanotherzero);
                if (pos < 3) sofar += '.';

                if (pos === 1 && ipParts[2] > 0) {
                    let last16 = ipParts[2] * 256 + ipParts[3];
                    for (let nextF of formats) {
                        results.push(sofar + formatVal(last16, nextF));
                        if (addanotherzero) {
                            results.push(sofar + formatVal(last16, nextF, true));
                        }
                    }
                }

                if (pos === 0 && (ipParts[2] > 0 || ipParts[1] > 0)) {
                    let last24 = ipParts[1] * 65536 + ipParts[2] * 256 + ipParts[3];
                    for (let nextF of formats) {
                        results.push(sofar + formatVal(last24, nextF));
                        if (addanotherzero) {
                            results.push(sofar + formatVal(last24, nextF, true));
                        }
                    }
                }

                if (pos === 3) {
                    results.push(sofar);
                    return;
                }
            } else {
                pos--;
            }

            for (let nextF of formats) {
                recurse(pos + 1, nextF, sofar);
            }
        }

        recurse();
        return Array.from(new Set(results));
    }

    function generateAndRender() {
        const ipStr = ipInput.value;
        const includeLeadingZeros = leadingZerosToggle.checked;
        const showLinks = showLinksToggle.checked;

        const ipParts = parseIP(ipStr);
        if (!ipParts) {
            errorMessage.style.display = 'block';
            resultsOutput.innerHTML = '';
            countBadge.textContent = '0';
            return;
        }

        errorMessage.style.display = 'none';

        let val = (ipParts[0] * 16777216) + (ipParts[1] * 65536) + (ipParts[2] * 256) + ipParts[3];

        let allResults = [];

        const dottedDec = ipParts.join('.');
        allResults.push(dottedDec);

        const formats = ['dec', 'hex', 'oct'];
        for (let f of formats) {
            if (val === 0 && f === 'oct' && !includeLeadingZeros) continue;
            allResults.push(formatVal(val, f));
        }

        let recurseResults = generateNotations(ipParts, includeLeadingZeros);
        allResults = allResults.concat(recurseResults);

        allResults = Array.from(new Set(allResults));

        countBadge.textContent = allResults.length;

        let maxLen = 0;
        if (showLinks) {
            for (let r of allResults) {
                maxLen = Math.max(maxLen, r.length);
            }
        }

        let html = '';
        allResults.forEach((result, idx) => {
            if (dottedDec === result && idx > 0) return;

            html += '<div class="output-line">';
            if (showLinks) {
                const spaces = ' '.repeat(maxLen + 4 - result.length);
                html += `<span>${result}${spaces}</span><a href="http://${result}" target="_blank" style="text-decoration:none;">http://${result}</a>`;
            } else {
                html += `<span>${result}</span>`;
            }
            html += '</div>';
        });

        resultsOutput.innerHTML = html;
    }
});
