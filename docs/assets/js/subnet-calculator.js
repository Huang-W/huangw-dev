document.addEventListener('DOMContentLoaded', () => {
    const networkInput = document.getElementById('network-input');
    const maskInput = document.getElementById('mask-input');
    const updateBtn = document.getElementById('update-btn');
    const subnetError = document.getElementById('subnet-error');
    const subnetWarning = document.getElementById('subnet-warning');
    const tbody = document.getElementById('subnet-tbody');

    let treeRoot = null;

    function ipToInt(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) return null;
        let val = 0;
        for (let i = 0; i < 4; i++) {
            const p = parseInt(parts[i], 10);
            if (isNaN(p) || p < 0 || p > 255) return null;
            val = (val * 256) + p;
        }
        return val;
    }

    function intToIp(val) {
        return [
            (val >>> 24) & 255,
            (val >>> 16) & 255,
            (val >>> 8) & 255,
            val & 255
        ].join('.');
    }

    function getHosts(mask) {
        if (mask === 32) return 1;
        if (mask === 31) return 2;
        return Math.pow(2, 32 - mask) - 2;
    }

    function buildTree(address, mask, parent = null) {
        return {
            address,
            mask,
            parent,
            left: null,
            right: null
        };
    }

    function initNetwork() {
        const ipStr = networkInput.value.trim();
        const maskStr = maskInput.value.trim();
        const ipVal = ipToInt(ipStr);
        const maskVal = parseInt(maskStr, 10);

        if (ipVal === null || isNaN(maskVal) || maskVal < 0 || maskVal > 32) {
            subnetError.style.display = 'block';
            if (subnetWarning) subnetWarning.style.display = 'none';
            return;
        }

        subnetError.style.display = 'none';
        if (subnetWarning) subnetWarning.style.display = 'none';

        // Apply network mask to get base network address
        const maskInt = maskVal === 0 ? 0 : (~0 << (32 - maskVal)) >>> 0;
        const baseNetwork = (ipVal & maskInt) >>> 0;

        if (baseNetwork !== ipVal) {
            const newIp = intToIp(baseNetwork);
            networkInput.value = newIp;
            if (subnetWarning) {
                subnetWarning.textContent = `Note: The original address ${ipStr} is not on a network boundary for this mask. It has been changed to ${newIp}.`;
                subnetWarning.style.display = 'block';
            }
        }

        treeRoot = buildTree(baseNetwork, maskVal);
        render();
    }

    function splitNode(node) {
        if (node.mask >= 32) return;
        const newMask = node.mask + 1;
        const offset = Math.pow(2, 32 - newMask);

        node.left = buildTree(node.address, newMask, node);
        node.right = buildTree(node.address + offset, newMask, node);
        render();
    }

    function joinNode(node) {
        if (!node || !node.parent) return;
        const p = node.parent;
        p.left = null;
        p.right = null;
        render();
    }

    function render() {
        tbody.innerHTML = '';
        const leaves = [];

        function traverse(node) {
            if (!node.left && !node.right) {
                leaves.push(node);
            } else {
                if (node.left) traverse(node.left);
                if (node.right) traverse(node.right);
            }
        }

        if (treeRoot) traverse(treeRoot);

        leaves.forEach(node => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';

            const maskInt = node.mask === 0 ? 0 : (~0 << (32 - node.mask)) >>> 0;
            const size = Math.pow(2, 32 - node.mask);

            const firstIp = node.address;
            const lastIp = node.address + size - 1;

            let useableFirst = firstIp;
            let useableLast = lastIp;

            if (node.mask < 31) {
                useableFirst++;
                useableLast--;
            }

            const rangeStr = `${intToIp(firstIp)} - ${intToIp(lastIp)}`;
            const useableStr = (node.mask >= 31) ? rangeStr : `${intToIp(useableFirst)} - ${intToIp(useableLast)}`;

            tr.innerHTML = `
                <td style="padding: 10px; font-family: monospace; white-space: nowrap;">${intToIp(node.address)}/${node.mask}</td>
                <td style="padding: 10px; font-family: monospace; white-space: nowrap;">${intToIp(maskInt)}</td>
                <td style="padding: 10px; font-family: monospace; white-space: nowrap;">${rangeStr}</td>
                <td style="padding: 10px; font-family: monospace; white-space: nowrap;">${useableStr}</td>
                <td style="padding: 10px; font-family: monospace;">${getHosts(node.mask).toLocaleString()}</td>
                <td style="padding: 10px; white-space: nowrap;">
                    <div style="display: flex; gap: 5px;"></div>
                </td>
            `;

            const actionCell = tr.lastElementChild.firstElementChild;

            if (node.mask < 32) {
                const divBtn = document.createElement('button');
                divBtn.textContent = 'Divide';
                divBtn.style.cssText = 'padding: 4px 8px; cursor: pointer; border: 1px solid #ccc; background: #f8f8f8; border-radius: 4px; font-size: 0.9em;';
                divBtn.onclick = () => splitNode(node);
                actionCell.appendChild(divBtn);
            }

            if (node.parent) {
                const joinBtn = document.createElement('button');
                joinBtn.textContent = 'Join Up';
                joinBtn.style.cssText = 'padding: 4px 8px; cursor: pointer; border: 1px solid #ccc; background: #eee; border-radius: 4px; font-size: 0.9em;';
                joinBtn.onclick = () => joinNode(node);
                actionCell.appendChild(joinBtn);
            }

            tbody.appendChild(tr);
        });
    }

    updateBtn.addEventListener('click', initNetwork);

    networkInput.addEventListener('keypress', e => { if (e.key === 'Enter') initNetwork(); });
    maskInput.addEventListener('keypress', e => { if (e.key === 'Enter') initNetwork(); });

    initNetwork();
});
