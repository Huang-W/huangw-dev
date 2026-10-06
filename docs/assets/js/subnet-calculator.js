document.addEventListener('DOMContentLoaded', () => {
    const networkInput = document.getElementById('network-input');
    const maskInput = document.getElementById('mask-input');
    const updateBtn = document.getElementById('update-btn');
    const subnetError = document.getElementById('subnet-error');
    const subnetWarning = document.getElementById('subnet-warning');
    const tbody = document.getElementById('subnet-tbody');

    const colSubnet = document.getElementById('col-subnet');
    const colNetmask = document.getElementById('col-netmask');
    const colRange = document.getElementById('col-range');
    const colUseable = document.getElementById('col-useable');
    const colHosts = document.getElementById('col-hosts');
    const colDivide = document.getElementById('col-divide');
    const colJoin = document.getElementById('col-join');
    
    const thSubnet = document.getElementById('th-subnet');
    const thNetmask = document.getElementById('th-netmask');
    const thRange = document.getElementById('th-range');
    const thUseable = document.getElementById('th-useable');
    const thHosts = document.getElementById('th-hosts');
    const thDivide = document.getElementById('th-divide');
    const thJoin = document.getElementById('join-header');

    const columns = [colSubnet, colNetmask, colRange, colUseable, colHosts, colDivide, colJoin];
    if (colSubnet) {
        columns.forEach(cb => cb.addEventListener('change', render));
    }

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
        if (!node) return;
        node.left = null;
        node.right = null;
        render();
    }

    function render() {
        tbody.innerHTML = '';
        
        function computeLeaves(node) {
            if (!node.left) {
                node.leavesCount = 1;
                return 1;
            }
            node.leavesCount = computeLeaves(node.left) + computeLeaves(node.right);
            return node.leavesCount;
        }

        function computeMaxDepth(node) {
            if (!node.left) return 0;
            return 1 + Math.max(computeMaxDepth(node.left), computeMaxDepth(node.right));
        }

        if (!treeRoot) return;

        computeLeaves(treeRoot);
        const maxDepth = computeMaxDepth(treeRoot);

        const joinHeader = document.getElementById('join-header');
        if (joinHeader) {
            joinHeader.colSpan = maxDepth + 1;
        }

        if (thSubnet) thSubnet.style.display = colSubnet.checked ? '' : 'none';
        if (thNetmask) thNetmask.style.display = colNetmask.checked ? '' : 'none';
        if (thRange) thRange.style.display = colRange.checked ? '' : 'none';
        if (thUseable) thUseable.style.display = colUseable.checked ? '' : 'none';
        if (thHosts) thHosts.style.display = colHosts.checked ? '' : 'none';
        if (thDivide) thDivide.style.display = colDivide.checked ? '' : 'none';
        if (thJoin) thJoin.style.display = colJoin.checked ? '' : 'none';

        function generateRows(node, depth, joinCellsToInject) {
            if (!node.left) {
                const tr = document.createElement('tr');

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

                let innerHTML = '';
                if (colSubnet && colSubnet.checked) innerHTML += `<td style="font-family: monospace; white-space: nowrap;">${intToIp(node.address)}/${node.mask}</td>`;
                if (colNetmask && colNetmask.checked) innerHTML += `<td style="font-family: monospace; white-space: nowrap;">${intToIp(maskInt)}</td>`;
                if (colRange && colRange.checked) innerHTML += `<td style="font-family: monospace; white-space: nowrap;">${rangeStr}</td>`;
                if (colUseable && colUseable.checked) innerHTML += `<td style="font-family: monospace; white-space: nowrap;">${useableStr}</td>`;
                if (colHosts && colHosts.checked) innerHTML += `<td style="font-family: monospace;">${getHosts(node.mask).toLocaleString()}</td>`;
                if (colDivide && colDivide.checked) innerHTML += `<td style="white-space: nowrap;"></td>`;
                tr.innerHTML = innerHTML;

                if (colDivide && colDivide.checked) {
                    const divCell = tr.lastElementChild;
                    if (node.mask < 32) {
                        const divLink = document.createElement('a');
                        divLink.textContent = 'Divide';
                        divLink.href = '#';
                        divLink.style.cssText = 'color: #0056b3; text-decoration: underline;';
                        divLink.onclick = (e) => {
                            e.preventDefault();
                            splitNode(node);
                        };
                        divCell.appendChild(divLink);
                    }
                }

                if (colJoin && colJoin.checked) {
                    const padCols = maxDepth - depth;
                    
                    const leafTd = document.createElement('td');
                    leafTd.colSpan = padCols + 1;
                    leafTd.style.verticalAlign = 'middle';
                    leafTd.style.backgroundColor = '#f4f4f4';
                    leafTd.style.textAlign = 'left';
                    
                    const leafSpan = document.createElement('span');
                    leafSpan.textContent = `/${node.mask}`;
                    leafSpan.style.cssText = 'display: inline-block; color: #666; font-size: 0.9em; width: 100%; box-sizing: border-box;';
                    leafTd.appendChild(leafSpan);
                    tr.appendChild(leafTd);

                    joinCellsToInject.forEach(cell => {
                        const td = document.createElement('td');
                        td.rowSpan = cell.rowspan;
                        td.style.verticalAlign = 'middle';
                        td.style.backgroundColor = '#eee';
                        td.style.cursor = 'pointer';
                        td.style.textAlign = 'center';
                        td.title = `Join subnets into /${cell.nodeToJoin.mask}`;
                        
                        td.onmouseover = () => { td.style.backgroundColor = '#ddd'; };
                        td.onmouseout = () => { td.style.backgroundColor = '#eee'; };
                        td.onclick = () => joinNode(cell.nodeToJoin);
                        
                        td.textContent = `/${cell.nodeToJoin.mask}`;
                        
                        tr.appendChild(td);
                    });
                }

                tbody.appendChild(tr);
            } else {
                const joinCell = {
                    rowspan: node.leavesCount,
                    nodeToJoin: node
                };
                
                generateRows(node.left, depth + 1, [joinCell, ...joinCellsToInject]);
                generateRows(node.right, depth + 1, []);
            }
        }

        generateRows(treeRoot, 0, []);
    }

    updateBtn.addEventListener('click', initNetwork);

    networkInput.addEventListener('keypress', e => { if (e.key === 'Enter') initNetwork(); });
    maskInput.addEventListener('keypress', e => { if (e.key === 'Enter') initNetwork(); });

    initNetwork();
});
