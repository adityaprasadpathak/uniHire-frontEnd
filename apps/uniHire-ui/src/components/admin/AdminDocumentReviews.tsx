import React from 'react';

const AdminDocumentReviews: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Document Reviews</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500 text-center py-8">
          All document reviews can be performed directly from the Candidates tab by clicking "Docs".
          <br/>
          A centralized review queue will be implemented here in the future.
        </p>
      </div>
    </div>
  );
};

export default AdminDocumentReviews;
