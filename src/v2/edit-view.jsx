import React from 'react';
import { useParams } from 'react-router-dom';

export default function FolderView() {
    let { id } = useParams();

    return (
        <div>
            Edit contact: { id }
        </div>
    );
}
