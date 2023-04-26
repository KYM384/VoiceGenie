from langchain.prompts import PromptTemplate
from langchain.agents import ZeroShotAgent, Tool, AgentExecutor, load_tools
from langchain import OpenAI, LLMChain, SerpAPIWrapper

import datetime


class Agent:
    def __init__(self):
        # self.llm = OpenAI(model_name="gpt-4", temperature=0.7)
        self.llm = OpenAI(temperature=0.7)
        search = SerpAPIWrapper()

        tools = [
            *load_tools(["google-search"], llm=self.llm),
        ]

        prefix = f"""あなたはユーザーを補助するヴァーチャルアシスタント「VoiceGenie ボイスジーニー」です。
        回答は日本語で、できるだけ短く生成してください。英語が含まれる場合はカタカナに直してください。
        今日の日付は{datetime.date.today()}です。
        あなたは以下のツールを使用することができます。
        """
        suffix = """
        {input}
        {agent_scratchpad}"""

        prompt = ZeroShotAgent.create_prompt(
            tools,
            prefix=prefix,
            suffix=suffix,
            input_variables=["input", "agent_scratchpad"]
        )
        llm_chain = LLMChain(llm=self.llm, prompt=prompt)
        agent = ZeroShotAgent(llm_chain=llm_chain, tools=tools)
        self.agent_executor = AgentExecutor.from_agent_and_tools(agent=agent, tools=tools, verbose=True)

    def __call__(self, question):
        ans = self.agent_executor.run(question)
        return ans

    def just_ask(self, prompt):
        return self.llm(prompt)
