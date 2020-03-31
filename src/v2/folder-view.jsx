import React from 'react';
import { useParams } from 'react-router-dom';

export default function FolderView() {
    let { folderId } = useParams();
    if (!folderId) {
        folderId = '7'; // '/Contacts'
    }

    return (
        <div>
            Folder view: { folderId }
        </div>
    );
}
