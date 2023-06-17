"use client";
import { useEffect, useState } from "react";
import { IWord, useStore } from "~/lib/store";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Button } from "~/components/ui/button";
import ConfettiExplosion from "react-confetti-explosion";
import shuffle from "lodash.shuffle";
import { vocabulary } from "~/lib/words";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import toast, { Toaster } from "react-hot-toast";

const ToggleButton = ({
  word,
  children,
}: {
  word: IWord;
  children: React.ReactNode;
}) => {
  const { selected, append, remove } = useStore();
  const [isOn, setIsOn] = useState(false);

  const handleToggle = (word: IWord) => {
    // check if the word is in the selected array
    if (!selected.find((w) => w.name === word.name)) {
      append(word);
    } else {
      remove(word);
    }
    setIsOn((s) => !s);
  };

  return (
    <motion.div
      layout
      exit={{ opacity: 0 }}
      transition={{ ease: "easeOut", duration: 0.5 }}
    >
      {isOn ? (
        <Button
          className="w-full h-16 lg:h-32 hover:animate-wiggle"
          onClick={() => handleToggle(word)}
        >
          <h2 className={`text-xs lg:text-2xl font-semibold`}>{children}</h2>
        </Button>
      ) : (
        <Button
          disabled={selected.length > 3}
          variant={"outline"}
          onClick={() => handleToggle(word)}
          className="w-full h-16 lg:h-32 hover:animate-wiggle"
        >
          <h2 className={`text-xs lg:text-2xl font-semibold`}>{children}</h2>
        </Button>
      )}
    </motion.div>
  );
};

interface IHits {
  [key: string]: string[];
}
export default function Home() {
  const selectWords = () => {
    // get 4 random keys from vocabulary object
    const keys = shuffle(Object.keys(vocabulary)).slice(0, 4);
    // get 4 random words from each array of words in vocabulary object from the selected keys
    return keys
      .map((key) =>
        shuffle(vocabulary[key])
          .slice(0, 4)
          .map((word) => ({ name: word, label: key } as IWord))
      )
      .flat();
  };
  const [words, setWords] = useState<IWord[]>([]);
  const [isExploding, setIsExploding] = useState(false);
  const { selected, clear } = useStore();
  const [chances, setChances] = useState(4); 
  const [mainkey, setMainkey] = useState(0);
  const [wordStateKey, setWordStateKey] = useState(0);
  const [isLoosing, setIsLoosing] = useState(false);
  const [hits, setHits] = useState<IHits>({});

  useEffect(() => {
    setWords(() => selectWords());
  }, []);

  useEffect(() => {
    if (Object.keys(hits).length === 4 && !isLoosing) {
      setIsExploding(true);
      toast.success('Você acertou! Parabéns!', { icon: '🎉'});
    }
  }, [hits, isLoosing]);

  const handleSubmit = () => {
    // console.log(selected);
    // if all selected words are from the same label, then the user chances
    const labels = selected.map((w) => w.label);
    const isSameLabel = labels.every((label) => label === labels[0]);
    if (isSameLabel) {
      // remove the selected words from the words array
      setWords(words.filter((w) => !selected.includes(w)));
      // add the selected words to the hits array
      setHits((h) => ({
        ...h,
        [labels[0]]: selected.map((w) => w.name),
      }));
    } else {
      setChances((c) => c - 1);
    }
    // unselect all words
    clear();
    setWordStateKey(wordStateKey + 1);
  };

  const handleReset = () => {
    clear();
    setWords(selectWords());
    console.log(selectWords());
    setMainkey(mainkey + 1);
    setChances(4);
    setHits({});
  };

  useEffect(() => {
    const handleLoose = () => {
      const labels = words.map((w) => w.label);
      labels.map((lb) =>
        setHits((h) => ({
          ...h,
          [lb]: words.filter((w) => w.label === lb).map((w) => w.name),
        }))
      );
      setWords([]);
    };
    if (chances === 0 && !isLoosing) {
      handleLoose();
      setIsLoosing(true);
      toast.error(' Fim das tentativas! Tente outra vez!', { icon: '🥲'});
    }
  }, [chances, words, isLoosing]);

  const selectColor = (label: string) => {
    switch (label) {
      case "LNLS":
        return "bg-blue-300";
      case "LNNano":
        return "bg-amber-400";
      case "LNBio":
        return "bg-indigo-300";
      case "LNBR":
        return "bg-green-500";
      default:
        return "bg-amber-400";
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-evenly">
      <div>
        <Toaster position="bottom-center" reverseOrder={false} />
        <h1 className="py-2 text-center text-sm text-muted-foreground">
          Escolha 4 palavras
        </h1>

        {isExploding && (
          <ConfettiExplosion
            force={0.8}
            duration={3000}
            particleCount={250}
            width={1600}
            onComplete={() => setIsExploding(false)}
          />
        )}
        <motion.div
          className="grid grid-cols-4 gap-1 m-1"
          layout
          animate={{ scale: [1, 1.1, 0.9, 1], rotate: [-5, 0, 5, 0] }}
          transition={{
            duration: 0.1,
            type: "spring",
            stiffness: 6000,
            damping: 10,
          }}
          key={wordStateKey}
        >
          <AnimatePresence>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ ease: "easeOut", duration: 2 }}
              className="col-span-4"
            >
              {Object.keys(hits).map((hit) => (
                <Card
                  className={cn(
                    "text-center  bg-amber-400 lg:py-4",
                    selectColor(hit)
                  )}
                  key={hit}
                >
                  <CardHeader>
                    <CardTitle className="dark:text-black">{hit}</CardTitle>
                    <CardDescription className="dark:text-gray-600">
                      {hits[hit].map((word) => word).join(", ")}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </motion.div>
            {words.map((word) => (
              <ToggleButton word={word} key={word.name}>
                {word.name}
              </ToggleButton>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[...Array(chances)].map((_, i) => (
          <Lightbulb
            className="fill-black dark:fill-white"
            size={20}
            key={"bulb_" + i}
          />
        ))}
        {[...Array(4 - chances)].map((_, i) => (
          <Lightbulb size={20} key={"bulb_" + i} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="destructive" onClick={handleReset}>
          Novo Jogo
        </Button>
        <Button
          onClick={() => setWords(shuffle(words))}
          variant="outline"
          disabled={words.length < 1}
        >
          Misturar
        </Button>
        <Button
          onClick={handleSubmit}
          variant={selected.length < 4 ? "outline" : "default"}
          disabled={selected.length < 4 || chances < 1}
        >
          Chutar
        </Button>
      </div>
    </main>
  );
}
