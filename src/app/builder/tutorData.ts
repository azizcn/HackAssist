/**
 * Contextual AI Tutor ("Solana Sensei") guidance data for each node type.
 * Organized by node type → sub-type → section (whatItDoes, howToUse, whatToModify).
 *
 * CRITICAL: All terminology uses Solana-native wording.
 * - "Solana Program" (never "Smart Contract")
 * - "Compute Units" / "Rent" (never "Gas Fees")
 * - "Phantom / Backpack Wallet" (never just "Wallet")
 */

export interface TutorGuidance {
  whatItDoes: { en: string; tr: string };
  howToUse: { en: string; tr: string };
  whatToModify: { en: string; tr: string };
}

const tutorData: Record<string, TutorGuidance> = {
  // ── State Struct ──────────────────────────────────────────
  "structNode:state": {
    whatItDoes: {
      en: "This block creates on-chain Account storage for your Solana Program. Think of it like a database table — each field is a column. When your program runs on Solana, this struct is serialized and stored in an Account on the blockchain. You pay Rent (in SOL) to keep this Account alive.",
      tr: "Bu blok, Solana Programınız için zincir üzerinde Hesap depolama oluşturur. Bunu bir veritabanı tablosu gibi düşünün — her alan bir sütundur. Programınız Solana'da çalıştığında, bu struct serileştirilir ve blockchain'deki bir Hesapta saklanır. Bu Hesabı canlı tutmak için Kira (SOL olarak) ödersiniz.",
    },
    howToUse: {
      en: "Place this near the TOP of your flow. It defines the data your Solana Program will remember between transactions. In the Anchor Framework, this becomes an #[account] struct. Connect it to a Context struct below.",
      tr: "Bunu akışınızın ÜST kısmına yerleştirin. Solana Programınızın işlemler arasında hatırlayacağı verileri tanımlar. Anchor Framework'te bu #[account] struct olur. Aşağıdaki bir Context struct'ına bağlayın.",
    },
    whatToModify: {
      en: "Change the struct name to describe your data (e.g., 'UserProfile', 'TokenState'). Add fields for each piece of data you need to store — like 'balance: u64' or 'owner: Pubkey'. Each field costs Rent proportional to its size.",
      tr: "Struct adını verilerinizi tanımlamak için değiştirin (ör. 'UserProfile', 'TokenState'). Depolamanız gereken her veri parçası için alanlar ekleyin — 'balance: u64' veya 'owner: Pubkey' gibi. Her alan boyutuyla orantılı Kira maliyeti taşır.",
    },
  },

  // ── Context Struct ────────────────────────────────────────
  "structNode:context": {
    whatItDoes: {
      en: "This defines the Accounts your Instruction needs to execute. In Solana, every Instruction must declare which Accounts it will read or write. Think of it as the 'permissions list' for your function — the Signer, the data Accounts, and any Programs you'll invoke via CPI.",
      tr: "Bu, Talimatınızın çalışması için gereken Hesapları tanımlar. Solana'da her Talimat hangi Hesapları okuyacağını veya yazacağını bildirmelidir. Bunu fonksiyonunuz için 'izin listesi' olarak düşünün — İmzalayıcı, veri Hesapları ve CPI ile çağıracağınız Programlar.",
    },
    howToUse: {
      en: "Connect this BELOW your State struct and ABOVE your Function block. It bridges your data storage to your program logic. In the Anchor Framework, this becomes a #[derive(Accounts)] struct. PDAs should also connect here.",
      tr: "Bunu State struct'ınızın ALTINA ve Function bloğunuzun ÜSTÜNE bağlayın. Veri depolamanızı program mantığınıza köprüler. Anchor Framework'te bu #[derive(Accounts)] struct olur. PDA'lar da buraya bağlanmalıdır.",
    },
    whatToModify: {
      en: "Add the Accounts your function needs: 'Signer<\\'info>' for the Phantom/Backpack wallet signing the transaction, 'Account<\\'info, YourState>' for data Accounts, 'Program<\\'info, System>' for system Programs. Connect PDA nodes here to add derived address constraints.",
      tr: "Fonksiyonunuzun ihtiyaç duyduğu Hesapları ekleyin: İşlemi imzalayan Phantom/Backpack cüzdanı için 'Signer<\\'info>', veri Hesapları için 'Account<\\'info, YourState>', sistem Programları için 'Program<\\'info, System>'. Türetilmiş adres kısıtlamaları eklemek için PDA düğümlerini buraya bağlayın.",
    },
  },

  // ── Function Node ─────────────────────────────────────────
  functionNode: {
    whatItDoes: {
      en: "This is your Solana Program's Instruction handler — the actual logic that runs on-chain. When someone calls your program via their Phantom/Backpack wallet, this function executes using the declared Compute Units. It receives a Context and returns a Result.",
      tr: "Bu, Solana Programınızın Talimat işleyicisidir — zincir üzerinde çalışan gerçek mantık. Birisi programınızı Phantom/Backpack cüzdanı aracılığıyla çağırdığında, bu fonksiyon bildirilen Hesaplama Birimlerini kullanarak çalışır. Bir Context alır ve bir Result döndürür.",
    },
    howToUse: {
      en: "Connect this BELOW your Context block. The edge between them tells the code generator which Accounts this Instruction can access. You can have multiple Instructions, each with their own Context. CPI nodes can also connect here.",
      tr: "Bunu Context bloğunuzun ALTINA bağlayın. Aralarındaki kenar, kod üretecisine bu Talimatın hangi Hesaplara erişebileceğini söyler. Her biri kendi Context'ine sahip birden fazla Talimatınız olabilir. CPI düğümleri de buraya bağlanabilir.",
    },
    whatToModify: {
      en: "Change the function name to describe your Instruction (e.g., 'initialize', 'transfer', 'mint_nft'). Edit the body with your Rust logic. The 'Ok(())' at the end means 'success' — keep it as the last line.",
      tr: "Fonksiyon adını Talimatınızı tanımlamak için değiştirin (ör. 'initialize', 'transfer', 'mint_nft'). Gövdeyi Rust mantığınızla düzenleyin. Sondaki 'Ok(())' 'başarılı' anlamına gelir — son satır olarak tutun.",
    },
  },

  // ── Transfer SOL Action ───────────────────────────────────
  "actionNode:transfer": {
    whatItDoes: {
      en: "This action block generates a SOL transfer Instruction. It creates the system Instruction to move SOL from one Account to another using Solana's System Program. The sender's Phantom/Backpack wallet must sign the transaction.",
      tr: "Bu eylem bloğu bir SOL transfer Talimatı oluşturur. Solana'nın System Programını kullanarak bir Hesaptan diğerine SOL taşımak için sistem Talimatını oluşturur. Göndericinin Phantom/Backpack cüzdanı işlemi imzalamalıdır.",
    },
    howToUse: {
      en: "This is a standalone action block — place it at the BOTTOM of your flow. It generates a complete transfer function with the necessary CPI (Cross-Program Invocation) calls to the System Program.",
      tr: "Bu bağımsız bir eylem bloğudur — akışınızın ALT kısmına yerleştirin. System Programına gerekli CPI (Çapraz Program Çağrısı) çağrılarıyla eksiksiz bir transfer fonksiyonu oluşturur.",
    },
    whatToModify: {
      en: "Edit the 'amount' parameter name and type if needed. Add a 'recipient' parameter with type 'Pubkey' to specify which Account receives the SOL. Transaction fees are measured in Compute Units.",
      tr: "'amount' parametre adını ve tipini gerekirse düzenleyin. SOL'un hangi Hesaba gideceğini belirtmek için 'Pubkey' tipinde bir 'recipient' parametresi ekleyin. İşlem ücretleri Hesaplama Birimleriyle ölçülür.",
    },
  },

  // ── Mint Token Action ─────────────────────────────────────
  "actionNode:mint": {
    whatItDoes: {
      en: "This action block generates a token minting Instruction. It uses the SPL Token Program via CPI to create new tokens and add them to a token Account. This is how Solana Programs create fungible tokens.",
      tr: "Bu eylem bloğu bir token basım Talimatı oluşturur. Yeni token'lar oluşturmak ve bunları bir token Hesabına eklemek için CPI ile SPL Token Programını kullanır. Solana Programları bu şekilde değiştirilebilir token'lar oluşturur.",
    },
    howToUse: {
      en: "This is a standalone action block — place it at the BOTTOM of your flow. It generates mint_to CPI calls that interact with the SPL Token Program.",
      tr: "Bu bağımsız bir eylem bloğudur — akışınızın ALT kısmına yerleştirin. SPL Token Programı ile etkileşime giren mint_to CPI çağrıları oluşturur.",
    },
    whatToModify: {
      en: "Edit the 'amount' parameter to control how many tokens are minted. The amount is typically in the smallest unit (like lamports for SOL). Each mint operation costs Compute Units.",
      tr: "Kaç token basılacağını kontrol etmek için 'amount' parametresini düzenleyin. Miktar genellikle en küçük birimde belirtilir (SOL için lamport gibi). Her basım işlemi Hesaplama Birimi maliyeti taşır.",
    },
  },

  // ── Template Node ─────────────────────────────────────────
  templateNode: {
    whatItDoes: {
      en: "This is a pre-built template that expands into a full set of blocks (State + Context + Function). It's a quick-start for common Solana Program patterns like token creation or NFT minting using the Anchor Framework.",
      tr: "Bu, tam bir blok setine (State + Context + Function) genişleyen önceden oluşturulmuş bir şablondur. Anchor Framework kullanarak token oluşturma veya NFT basımı gibi yaygın Solana Program kalıpları için hızlı başlangıçtır.",
    },
    howToUse: {
      en: "Click the 'Expand Template' button to generate the individual blocks. Once expanded, you can modify each block separately. The template node itself will be replaced by real Solana Program components.",
      tr: "'Şablonu Genişlet' düğmesine tıklayarak ayrı blokları oluşturun. Genişletildikten sonra her bloğu ayrı ayrı değiştirebilirsiniz. Şablon düğümünün kendisi gerçek Solana Program bileşenleriyle değiştirilecektir.",
    },
    whatToModify: {
      en: "Don't modify the template directly — expand it first! After expansion, customize the generated State struct fields, Context Accounts, and Instruction logic to match your Solana Program.",
      tr: "Şablonu doğrudan değiştirmeyin — önce genişletin! Genişletmeden sonra, oluşturulan State struct alanlarını, Context Hesaplarını ve Talimat mantığını Solana Programınıza uyacak şekilde özelleştirin.",
    },
  },

  // ── PDA Node (Program Derived Address) ────────────────────
  pdaNode: {
    whatItDoes: {
      en: "Ah, PDAs! Think of this as a vault that only your Solana Program has the key to. It doesn't have a private key. Instead, Solana derives the address from 'seeds' — deterministic inputs that let your program find and control this Account without needing a Signer. PDAs are foundational to Solana architecture.",
      tr: "Ah, PDA'lar! Bunu sadece Solana Programınızın anahtarına sahip olduğu bir kasa olarak düşünün. Özel anahtarı yoktur. Bunun yerine Solana, adresi 'seed'lerden (tohumlardan) türetir — programınızın bir İmzalayıcıya ihtiyaç duymadan bu Hesabı bulmasını ve kontrol etmesini sağlayan deterministik girdiler. PDA'lar Solana mimarisinin temelini oluşturur.",
    },
    howToUse: {
      en: "Connect this INTO a Context struct. The PDA will generate #[account(seeds = [...], bump)] constraints in the generated Anchor code. Set your seeds below — they determine the unique address. Common seeds include program name strings and user public keys.",
      tr: "Bunu bir Context struct'ına BAĞLAYIN. PDA, oluşturulan Anchor kodunda #[account(seeds = [...], bump)] kısıtlamaları üretecektir. Aşağıdaki seed'lerinizi ayarlayın — benzersiz adresi belirlerler. Yaygın seed'ler program adı dizeleri ve kullanıcı public key'leri içerir.",
    },
    whatToModify: {
      en: "Set the 'seed' values below. Seeds are byte strings that uniquely identify this PDA. Toggle 'bump' to add the canonical bump seed (recommended). Example: seeds = [b\"user_vault\", user.key()] creates a unique vault per user.",
      tr: "Aşağıdaki 'seed' değerlerini ayarlayın. Seed'ler bu PDA'yı benzersiz şekilde tanımlayan bayt dizileridir. Kanonik bump seed'i eklemek için 'bump'ı açın (önerilir). Örnek: seeds = [b\"user_vault\", user.key()] kullanıcı başına benzersiz bir kasa oluşturur.",
    },
  },

  // ── CPI Node (Cross-Program Invocation) ───────────────────
  cpiNode: {
    whatItDoes: {
      en: "CPIs are how Solana Programs talk to each other! This node represents a Cross-Program Invocation — calling an Instruction on another Solana Program (like the SPL Token Program or System Program) from within your own program. Think of it as making a function call to another program on-chain.",
      tr: "CPI'lar Solana Programlarının birbirleriyle konuşma şeklidir! Bu düğüm bir Çapraz Program Çağrısını temsil eder — kendi programınız içinden başka bir Solana Programında (SPL Token Programı veya System Programı gibi) bir Talimat çağırma. Bunu zincir üzerinde başka bir programa fonksiyon çağrısı yapmak gibi düşünün.",
    },
    howToUse: {
      en: "Connect this to a Function node. The CPI will generate CpiContext::new(...) code inside your Instruction handler. Specify the target Solana Program, the Instruction name, and the Accounts it needs. The Anchor Framework handles the low-level invoke() for you.",
      tr: "Bunu bir Function düğümüne bağlayın. CPI, Talimat işleyiciniz içinde CpiContext::new(...) kodu üretecektir. Hedef Solana Programını, Talimat adını ve ihtiyaç duyduğu Hesapları belirtin. Anchor Framework düşük seviyeli invoke() işlemini sizin yerinize halleder.",
    },
    whatToModify: {
      en: "Set the 'target_program' (e.g., 'Token Program', 'System Program'). Set the 'instruction' name (e.g., 'transfer', 'mint_to'). Add the Accounts that the CPI requires — these must be passed through from your Context.",
      tr: "'target_program'ı ayarlayın (ör. 'Token Program', 'System Program'). 'instruction' adını ayarlayın (ör. 'transfer', 'mint_to'). CPI'ın gerektirdiği Hesapları ekleyin — bunlar Context'inizden geçirilmelidir.",
    },
  },
};

/**
 * Get the tutor data key for a given node.
 */
export function getTutorKey(nodeType: string, nodeData: Record<string, unknown>): string {
  if (nodeType === "structNode") {
    return `structNode:${nodeData.nodeCategory || "state"}`;
  }
  if (nodeType === "actionNode") {
    return `actionNode:${nodeData.actionType || "transfer"}`;
  }
  return nodeType;
}

/**
 * Get tutor guidance for a specific node.
 */
export function getTutorGuidance(
  nodeType: string,
  nodeData: Record<string, unknown>
): TutorGuidance | null {
  const key = getTutorKey(nodeType, nodeData);
  return tutorData[key] || null;
}

export default tutorData;
