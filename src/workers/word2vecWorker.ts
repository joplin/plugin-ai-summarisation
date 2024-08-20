import w2v from 'word2vec';

self.addEventListener("message", async (event) => {
    console.debug("Got message in Word2Vec worker");
    const { type, file, text } = event.data;

    if (type === 'loadModel') {
        w2v.loadModel(file, (error, model) => {
            if (error) {
                postMessage({ error: error.message });
            } else {
                postMessage({ model });
            }
        });
    }

    if (type === 'vectorize') {
        console.debug(`Vectorization initialized: ${file}`);
        const regexPattern = /\[[^\]]*\]|\bhttps?:\/\/\S+\b/g;    
        const cleanedText = text.replace(regexPattern, '');
        cleanedText.trim();

        const params = {
            size: 200,
            window: 5,          
            sample: 1e-3,      
            hs: 0,              
            negative: 5,        
            threads: 12,        
            iter: 10,            
            minCount: 5,        
            alpha: 0.025,       
            cbow: 1,            
            debug: 2,           
            binary: 0,          
            silent: false       
        };

        w2v.word2vec(cleanedText, file, params, (code) => {
            if (code !== 0) {
                console.error('Error during Word2Vec training');
            } else {
                console.log(`Word2Vec model training complete. Vectors saved to ${file}`);
            }
        });
    }
});



