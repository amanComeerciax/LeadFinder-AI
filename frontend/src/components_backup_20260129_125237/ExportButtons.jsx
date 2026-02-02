const ExportButtons = ({ businesses }) => {
    const exportToCSV = () => {
        if (businesses.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['Name', 'Address', 'Phone', 'Email', 'Website', 'Rating', 'Reviews', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter'];
        const csvContent = [
            headers.join(','),
            ...businesses.map((business) =>
                [
                    `"${business.name}"`,
                    `"${business.address}"`,
                    `"${business.phone}"`,
                    `"${business.email || 'N/A'}"`,
                    `"${business.website}"`,
                    business.rating,
                    business.totalReviews,
                    `"${business.socialLinks?.facebook || ''}"`,
                    `"${business.socialLinks?.instagram || ''}"`,
                    `"${business.socialLinks?.linkedin || ''}"`,
                    `"${business.socialLinks?.twitter || ''}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `businesses_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={exportToCSV}
            disabled={businesses.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
        </button>
    );
};

export default ExportButtons;
