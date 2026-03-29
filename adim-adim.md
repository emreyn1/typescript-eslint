Haklısınız — Safari'yi karıştırmaya gerek yok. Tek Chrome ile her şeyi yapabilirsiniz. mitmweb arayüzü 127.0.0.1:8081'e gider ama bu adres proxy'den geçmez (localhost olduğu için), yani Chrome proxy'li olsa bile sorun olmaz.

Adım 1 — Temizlik:

pkill -f mitmweb
Adım 2 — Chrome'u tamamen kapatın (Cmd+Q).

Adım 3 — mitmweb'i başlatın:

mitmweb --set web_open_browser=false --set web_password=1234 &
Adım 4 — Chrome'u proxy ile açın:

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --proxy-server="http://127.0.0.1:8080" &
Adım 5 — Chrome'da ilk sekme olarak mitmweb arayüzünü açın:

Adres çubuğuna yazın:

http://127.0.0.1:8081
Şifre soracak, yazın: 1234

Arayüz açılacak — bu sekmeyi açık bırakın.

Adım 6 — Chrome'da yeni sekme açın, hedef embed sitesine gidin, videoyu oynatın.

Adım 7 — mitmweb sekmesine dönün, isteklerin listelendiğini görün.

Hepsi tek Chrome'da. Başka tarayıcı etkilenmez. Deneyin.

