const createBufferTrailer = (pdf, info, addedReferences) => {
    const rows = info.xref.tableRows;
    addedReferences.forEach((offset, index) => {
        const paddedOffset = (`0000000000${offset}`).slice(-10);
        rows[index] = `${paddedOffset} 00000 n `;
    });

    return Buffer.concat([
        Buffer.from('xref\n'),
        Buffer.from(`${info.xref.startingIndex} ${rows.length}\n`),
        Buffer.from(rows.join('\n')),
        Buffer.from('\ntrailer\n'),
        Buffer.from('<<\n'),
        Buffer.from(`/Size ${rows.length}\n`),
        Buffer.from(`/Prev ${info.xref.tableOffset}\n`),
        Buffer.from(`/Root ${info.rootRef}\n`),
        Buffer.from('>>\n'),
        Buffer.from('startxref\n'),
        Buffer.from(`${pdf.length}\n`),
        Buffer.from('%%EOF'),
    ]);
};

export default createBufferTrailer;
