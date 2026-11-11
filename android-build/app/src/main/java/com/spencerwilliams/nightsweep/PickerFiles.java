package com.spencerwilliams.nightsweep;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import android.webkit.MimeTypeMap;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Locale;

/** Private read-only chooser copies. These files are data, never rendered documents. */
public final class PickerFiles extends ContentProvider {
    @Override public boolean onCreate(){return true;}

    static File fileFor(Context context,Uri uri) throws FileNotFoundException {
        List<String> parts=uri.getPathSegments();
        if(!"content".equals(uri.getScheme()) || !(context.getPackageName()+".pickerfiles").equals(uri.getAuthority()) || parts.size()!=2 || !parts.get(0).matches("[a-f0-9]{32}"))throw new FileNotFoundException("Invalid import reference");
        String name=parts.get(1);
        if(name.isEmpty() || ".".equals(name) || "..".equals(name) || name.indexOf('/')>=0 || name.indexOf('\\')>=0)throw new FileNotFoundException("Invalid import name");
        try {
            File directory=new File(new File(context.getCacheDir(),"picker-imports"),parts.get(0)).getCanonicalFile();
            File file=new File(directory,name).getCanonicalFile();
            if(!directory.equals(file.getParentFile()) || !file.isFile())throw new FileNotFoundException("Import copy is unavailable");
            return file;
        }catch(IOException e){throw new FileNotFoundException("Unreadable import copy");}
    }

    static void delete(Context context,Uri uri) {
        try{File file=fileFor(context,uri);file.delete();file.getParentFile().delete();}catch(Exception ignored){}
    }

    static void prune(Context context) {
        File root=new File(context.getCacheDir(),"picker-imports");
        File[] folders=root.listFiles();if(folders==null)return;
        // Keep active/recent chooser copies until the JS file read has finished. Long-term
        // evidence storage belongs to IndexedDB; cache copies are only the transfer stage.
        long cutoff=System.currentTimeMillis()-24L*60*60*1000;
        for(File folder:folders)if(folder.isDirectory() && folder.lastModified()<cutoff){File[] files=folder.listFiles();if(files!=null)for(File file:files)file.delete();folder.delete();}
    }

    @Override public ParcelFileDescriptor openFile(Uri uri,String mode) throws FileNotFoundException {
        if(!"r".equals(mode))throw new FileNotFoundException("Import copies are read-only");
        return ParcelFileDescriptor.open(fileFor(getContext(),uri),ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override public String getType(Uri uri) {
        try {
            String name=fileFor(getContext(),uri).getName();int dot=name.lastIndexOf('.');
            String extension=dot<0?"":name.substring(dot+1).toLowerCase(Locale.ROOT);
            if("json".equals(extension))return "application/json";
            if("csv".equals(extension))return "text/csv";
            String type=MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
            return type==null?"application/octet-stream":type;
        }catch(Exception e){return "application/octet-stream";}
    }

    @Override public Cursor query(Uri uri,String[] projection,String selection,String[] args,String order) {
        try {
            File file=fileFor(getContext(),uri);
            String[] columns=projection==null?new String[]{OpenableColumns.DISPLAY_NAME,OpenableColumns.SIZE}:projection;
            MatrixCursor cursor=new MatrixCursor(columns);Object[] values=new Object[columns.length];
            for(int i=0;i<columns.length;i++)values[i]=OpenableColumns.DISPLAY_NAME.equals(columns[i])?file.getName():OpenableColumns.SIZE.equals(columns[i])?file.length():null;
            cursor.addRow(values);return cursor;
        }catch(Exception e){return null;}
    }

    @Override public Uri insert(Uri uri,ContentValues values){throw new UnsupportedOperationException("Read-only imports");}
    @Override public int update(Uri uri,ContentValues values,String selection,String[] args){throw new UnsupportedOperationException("Read-only imports");}
    @Override public int delete(Uri uri,String selection,String[] args){throw new UnsupportedOperationException("Read-only imports");}
}
