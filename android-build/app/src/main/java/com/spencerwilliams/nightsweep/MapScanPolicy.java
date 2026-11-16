package com.spencerwilliams.nightsweep;

import java.net.URI;
import java.net.InetAddress;
import java.util.Locale;

/** Pure allowlist policy shared by the native bridge and executable JVM checks. */
public final class MapScanPolicy {
    private MapScanPolicy() {}
    public static String origin(String value) throws Exception {
        URI uri = new URI(value == null ? "" : value);
        String host = uri.getHost();
        if (!"https".equals(uri.getScheme()) || host == null || uri.getUserInfo() != null ||
            uri.getQuery() != null || uri.getFragment() != null ||
            (uri.getPort() != -1 && uri.getPort() != 443) ||
            !(uri.getPath().isEmpty() || "/".equals(uri.getPath())) ||
            !host.matches("[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+") ||
            host.length()>253 || host.matches("[0-9.]+") ||
            host.toLowerCase(Locale.ROOT).matches(".*\\.(local|localhost|internal|invalid|test|example|onion|lan|home|corp)")) {
            throw new IllegalArgumentException("Use a public HTTPS scanner origin only.");
        }
        for(String label:host.split("\\."))if(label.length()>63 || label.startsWith("-") || label.endsWith("-"))
            throw new IllegalArgumentException("Use a public HTTPS scanner origin only.");
        return "https://" + host.toLowerCase(Locale.ROOT);
    }
    public static boolean callbackId(String id) {
        return id != null && id.matches("[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}");
    }
    public static boolean publicAddress(InetAddress address) {
        if(address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress() ||
           address.isSiteLocalAddress() || address.isMulticastAddress())return false;
        byte[] b=address.getAddress();
        if(b.length==4) {
            int a=b[0]&255,c=b[1]&255;
            return a!=0 && a!=10 && a!=127 && a<224 && !(a==100 && c>=64 && c<=127) &&
                   !(a==169 && c==254) && !(a==172 && c>=16 && c<=31) &&
                   !(a==192 && (c==0 || c==168)) && !(a==198 && (c==18 || c==19)) &&
                   !(a==203 && c==0) && !(a==192 && c==0) && !(a==198 && c==51);
        }
        if(b.length==16) {
            if((b[0]&0xe0)!=0x20) return false; // Only IPv6 global unicast space.
            if((b[0]&255)==0x20 && (b[1]&255)==0x01 && (b[2]&255)==0x0d && (b[3]&255)==0xb8)return false;
            return true;
        }
        return false;
    }
}
