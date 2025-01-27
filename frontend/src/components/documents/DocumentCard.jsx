const DocumentCard = ({ document, onDownload, onDelete }) => {
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
      return (bytes/(1024*1024)).toFixed(1) + ' MB';
    };
  
    return (
      <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-500" />
          <div>
            <h3 className="font-medium">{document.name}</h3>
            <p className="text-sm text-gray-600">
              {formatFileSize(document.size)} • {document.category || 'Uncategorized'}
            </p>
            {document.description && (
              <p className="text-sm text-gray-500 mt-1">{document.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  export default DocumentCard;